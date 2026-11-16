"use client";

import { useWebMCP } from "use-webmcp-tool";

type SearchProductsArgs = {
  query?: string;
  category?: string;
  limit?: number;
};

const categories = [
  "Sarees",
  "Suits & Sets",
  "Jewellery",
  "Watches",
  "Bags",
  "Footwear",
  "Men's Wear",
  "Home & Living",
  "Accessories",
];

/**
 * Read-only WebMCP tools. The official hook handles feature detection and
 * component lifecycle; browsers without WebMCP simply ignore registration.
 */
export function WebMcpTools() {
  useWebMCP({
    name: "search_saanwariya_products",
    description: "Search the public Saanwariya Seth Fashion catalogue by product name, brand, or category. Returns current public product prices in INR, product URLs, and availability. This tool is read-only and cannot place orders.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional product name or brand keywords. Maximum 80 characters." },
        category: { type: "string", enum: categories, description: "Optional exact store category." },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "Maximum number of products to return; defaults to 10." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    async execute(args: SearchProductsArgs) {
      const query = String(args?.query ?? "").trim().slice(0, 80);
      const category = categories.includes(String(args?.category ?? "")) ? String(args.category) : "";
      const limit = Math.min(20, Math.max(1, Math.trunc(Number(args?.limit) || 10)));
      const search = new URLSearchParams();
      if (query) search.set("q", query);
      if (category) search.set("category", category);
      const response = await fetch(`/api/products?${search.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return { error: "The public product catalogue is temporarily unavailable." };
      const payload = await response.json() as { products?: Array<Record<string, unknown>> };
      const products = Array.isArray(payload.products) ? payload.products.slice(0, limit) : [];
      return products.map((product) => ({
        name: String(product.name ?? ""),
        brand: String(product.brand ?? ""),
        category: String(product.category ?? ""),
        description: String(product.description ?? ""),
        price: Number(product.price ?? 0),
        currency: "INR",
        availability: Number(product.stock ?? 0) > 0 ? "InStock" : "OutOfStock",
        productUrl: `https://saanwariyasethfashion.com/product/${encodeURIComponent(String(product.slug ?? ""))}`,
        source: product.source === "FLIPKART" ? "External marketplace listing" : "Saanwariya store catalogue",
      }));
    },
  });

  useWebMCP({
    name: "get_saanwariya_store_information",
    description: "Get public information about Saanwariya Seth Fashion and links to its shopping, contact, shipping, returns, privacy, and terms pages. This tool does not access customer accounts or order records.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute() {
      const base = "https://saanwariyasethfashion.com";
      return {
        name: "Saanwariya Seth Fashion",
        website: base,
        currency: "INR",
        language: "en-IN",
        categories,
        publicPages: {
          shop: `${base}/shop`,
          about: `${base}/about`,
          contact: `${base}/contact`,
          faq: `${base}/faq`,
          shipping: `${base}/shipping-returns`,
          exchangeAndReturns: `${base}/exchange-returns`,
          privacy: `${base}/privacy`,
          terms: `${base}/terms`,
          cookiePolicy: `${base}/cookie-policy`,
        },
        limitations: "Tools are read-only. They cannot log in, access customer data, place orders, update stock, or process payments.",
      };
    },
  });

  return null;
}
