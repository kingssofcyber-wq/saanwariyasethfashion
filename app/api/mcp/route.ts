import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categories, demoProducts, type Product } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"];
const TOOL_DEFINITIONS = [
  {
    name: "search_store_products",
    title: "Search public store products",
    description: "Search publicly listed Saanwariya Seth Fashion products. Returns product name, category, current listed price in INR, stock availability and public product URL. Read-only; cannot place orders.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional product name or brand search, up to 80 characters." },
        category: { type: "string", enum: categories.map((item) => item.name) },
        limit: { type: "integer", minimum: 1, maximum: 20, default: 10 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "get_store_information",
    title: "Get public store information",
    description: "Get public store information and key policy/contact page URLs. Does not read customer or order information.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
];

type JsonRpcId = string | number | null;
type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

function jsonRpcResult(id: JsonRpcId, result: unknown, protocolVersion?: string) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*",
  });
  if (protocolVersion && PROTOCOL_VERSIONS.includes(protocolVersion)) {
    headers.set("MCP-Protocol-Version", protocolVersion);
  }
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { headers });
}

function jsonRpcError(id: JsonRpcId, code: number, message: string, data?: unknown) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data === undefined ? {} : { data }) },
  }, {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}

function publicProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    price: Number(product.price),
    mrp: Number(product.mrp),
    currency: siteConfig.currency,
    availability: Number(product.stock) > 0 ? "InStock" : "OutOfStock",
    stock: Math.max(0, Number(product.stock)),
    url: `${siteConfig.url}/product/${encodeURIComponent(product.slug)}`,
    image: product.image.startsWith("http") ? product.image : `${siteConfig.url}${product.image.startsWith("/") ? "" : "/"}${product.image}`,
    source: product.source === "FLIPKART" ? "External marketplace listing" : "Saanwariya store catalogue",
    externalUrl: product.source === "FLIPKART" ? product.externalUrl || null : null,
  };
}

async function searchProducts(args: Record<string, unknown>) {
  const query = typeof args.query === "string" ? args.query.trim().slice(0, 80) : "";
  const category = typeof args.category === "string" && categories.some((item) => item.name === args.category) ? args.category : "";
  const parsedLimit = Number(args.limit);
  const limit = Number.isFinite(parsedLimit) ? Math.min(20, Math.max(1, Math.trunc(parsedLimit))) : 10;

  try {
    const rows = await prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(query ? { OR: [{ name: { contains: query } }, { brand: { contains: query } }, { category: { contains: query } }] } : {}),
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return { products: rows.map((row) => publicProduct(row as Product)), catalogueSource: "database" };
  } catch {
    const filtered = demoProducts.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const haystack = `${item.name} ${item.brand} ${item.category}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query.toLowerCase()));
    }).slice(0, limit);
    return { products: filtered.map(publicProduct), catalogueSource: "demo-fallback" };
  }
}

function getStoreInformation() {
  return {
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    website: `${siteConfig.url}/`,
    currency: siteConfig.currency,
    language: "en-IN",
    categories: categories.map((item) => item.name),
    supportEmail: siteConfig.supportEmail || null,
    supportPhone: siteConfig.supportPhone || null,
    pages: {
      shop: `${siteConfig.url}/shop`,
      about: `${siteConfig.url}/about`,
      contact: `${siteConfig.url}/contact`,
      faq: `${siteConfig.url}/faq`,
      shipping: `${siteConfig.url}/shipping-returns`,
      exchangeAndReturns: `${siteConfig.url}/exchange-returns`,
      privacy: `${siteConfig.url}/privacy`,
      cookies: `${siteConfig.url}/cookie-policy`,
      terms: `${siteConfig.url}/terms`,
      disclaimer: `${siteConfig.url}/disclaimer`,
    },
    boundaries: "Public read-only information only. This server cannot authenticate users, access customer accounts or order records, place orders, change stock, or process payments.",
  };
}

function mcpToolResult(value: unknown, isError = false) {
  const text = JSON.stringify(value, null, 2);
  return {
    content: [{ type: "text", text }],
    structuredContent: value,
    isError,
  };
}

export async function POST(request: NextRequest) {
  // Public, read-only catalogue tools use wildcard CORS below. Do not reject a
  // browser Origin: cross-origin AI clients need to call this public endpoint.

  let body: JsonRpcRequest;
  try {
    body = await request.json() as JsonRpcRequest;
  } catch {
    return jsonRpcError(null, -32700, "Parse error");
  }

  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return jsonRpcError(body.id ?? null, -32600, "Invalid Request");
  }

  // MCP notifications have no id and do not receive a JSON-RPC response body.
  if (body.id === undefined && body.method.startsWith("notifications/")) {
    return new NextResponse(null, { status: 202, headers: { "Cache-Control": "no-store" } });
  }
  if (body.id === undefined) return jsonRpcError(null, -32600, "Requests must include an id");

  const id = body.id;
  const requestedProtocol = typeof request.headers.get("MCP-Protocol-Version") === "string"
    ? request.headers.get("MCP-Protocol-Version")!
    : String(body.params?.protocolVersion || "2025-11-25");

  switch (body.method) {
    case "initialize": {
      const clientVersion = String(body.params?.protocolVersion || "2025-11-25");
      if (!PROTOCOL_VERSIONS.includes(clientVersion)) {
        return jsonRpcError(id, -32022, "Unsupported protocol version", {
          supported: PROTOCOL_VERSIONS,
          requested: clientVersion,
        });
      }
      const negotiatedVersion = clientVersion;
      return jsonRpcResult(id, {
        protocolVersion: negotiatedVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: "com.saanwariyasethfashion/store",
          title: "Saanwariya Seth Fashion Public Store Tools",
          version: "1.0.0",
        },
        instructions: "This MCP server exposes public, read-only product catalogue and store information. It cannot access private customer data or perform transactions.",
      }, negotiatedVersion);
    }
    case "ping":
      return jsonRpcResult(id, {}, requestedProtocol);
    case "tools/list":
      return jsonRpcResult(id, { tools: TOOL_DEFINITIONS }, requestedProtocol);
    case "tools/call": {
      const toolName = String(body.params?.name || "");
      const args = body.params?.arguments && typeof body.params.arguments === "object"
        ? body.params.arguments as Record<string, unknown>
        : {};
      try {
        if (toolName === "search_store_products") {
          return jsonRpcResult(id, mcpToolResult(await searchProducts(args)), requestedProtocol);
        }
        if (toolName === "get_store_information") {
          return jsonRpcResult(id, mcpToolResult(getStoreInformation()), requestedProtocol);
        }
        return jsonRpcError(id, -32602, `Unknown tool: ${toolName}`);
      } catch {
        return jsonRpcResult(id, mcpToolResult({ error: "The public store tool is temporarily unavailable." }, true), requestedProtocol);
      }
    }
    default:
      return jsonRpcError(id, -32601, `Method not found: ${body.method}`);
  }
}

export async function GET() {
  return new NextResponse("This MCP endpoint supports POST requests for JSON-RPC. GET is not used for SSE streaming.", {
    status: 405,
    headers: { Allow: "POST, OPTIONS", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version",
      "Access-Control-Max-Age": "86400",
    },
  });
}
