import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoProducts, type Product } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function productMarkdown(product: Product): string {
  return [
    `### [${product.name}](${siteConfig.url}/product/${encodeURIComponent(product.slug)})`,
    `- Category: ${product.category}`,
    `- Brand: ${product.brand || siteConfig.name}`,
    `- Price: ${formatPrice(Number(product.price))}`,
    `- Availability: ${Number(product.stock) > 0 ? "In stock" : "Out of stock"}`,
    `- Description: ${product.description.replace(/\s+/g, " ").trim()}`,
  ].join("\n");
}

export async function GET() {
  let products: Product[] = demoProducts;
  let catalogueSource = "demo catalogue shown for preview";

  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 40,
    });
    if (rows.length > 0) {
      products = rows as Product[];
      catalogueSource = "live product database";
    }
  } catch {
    // The markdown page remains useful as a public fallback if the database is briefly offline.
  }

  const ownProducts = products.filter((product) => product.source !== "FLIPKART");
  const body = [
    `# ${siteConfig.name}`,
    "",
    "> Indian online fashion and lifestyle storefront for sarees, suits and sets, jewellery, watches, bags, footwear, men's wear, accessories and home & living.",
    "",
    `Website: ${siteConfig.url}/`,
    `Currency: ${siteConfig.currency} (Indian Rupee)`,
    `Catalogue source: ${catalogueSource}`,
    "",
    "## Shop",
    `- All products: ${siteConfig.url}/shop`,
    `- Marketplace picks: ${siteConfig.url}/shop/marketplace`,
    `- About: ${siteConfig.url}/about`,
    `- Contact: ${siteConfig.url}/contact`,
    `- FAQ: ${siteConfig.url}/faq`,
    "",
    "## Policies",
    `- Privacy: ${siteConfig.url}/privacy`,
    `- Cookies: ${siteConfig.url}/cookie-policy`,
    `- Terms: ${siteConfig.url}/terms`,
    `- Shipping: ${siteConfig.url}/shipping-returns`,
    `- Exchange and returns: ${siteConfig.url}/exchange-returns`,
    `- Disclaimer: ${siteConfig.url}/disclaimer`,
    "",
    "## Public product catalogue and current prices",
    "Prices and stock can change. The linked product page is the source of truth at the time of purchase.",
    "",
    ...ownProducts.map(productMarkdown),
    "",
    "## Discovery and machine-readable information",
    `- Sitemap: ${siteConfig.url}/sitemap.xml`,
    `- Robots: ${siteConfig.url}/robots.txt`,
    `- LLM guide: ${siteConfig.url}/llms.txt`,
    `- AI Catalog: ${siteConfig.url}/.well-known/ai-catalog.json`,
    `- MCP Server Card: ${siteConfig.url}/api/mcp/server-card`,
    `- Read-only MCP endpoint: ${siteConfig.url}/api/mcp`,
    "",
    "## Agent safety boundaries",
    "Public machine-readable tools are read-only. They can search public products and retrieve public store information. They cannot sign in, access customer accounts or orders, change inventory, create orders, or process payments.",
    "",
    "## Notes",
    "Some catalogue entries and photographs may be demonstration content until replaced by the store owner with verified product details and SKU-specific images. Do not treat demonstration listings as confirmed supplier or stock claims.",
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=120, s-maxage=300, stale-while-revalidate=600",
      "Vary": "Accept",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
