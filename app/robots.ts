import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/account", "/cart", "/checkout", "/orders", "/login", "/register", "/wishlist", "/compare"] }], sitemap: `${siteConfig.url}/sitemap.xml`, host: siteConfig.url };
}
