import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { demoProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/shop", "/about", "/contact", "/faq", "/privacy", "/terms", "/shipping-returns", "/exchange-returns", "/cookie-policy", "/disclaimer", "/style-journal", "/shop/marketplace"];
  const now = new Date();
  let productPaths = demoProducts.map((product) => product.slug);
  try { const rows = await prisma.product.findMany({ where: { active: true }, select: { slug: true } }); if (rows.length) productPaths = rows.map((row) => row.slug); } catch { /* Sitemap remains available from the demo catalogue if the database is offline. */ }
  return [
    ...pages.map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: now, changeFrequency: path === "" ? "daily" as const : "monthly" as const, priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6 })),
    ...productPaths.map((slug) => ({ url: `${siteConfig.url}/product/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
