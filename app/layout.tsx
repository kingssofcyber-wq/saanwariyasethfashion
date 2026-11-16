import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SalePopup } from "@/components/sale-popup";
import { ChatWidget } from "@/components/chat-widget";
import { AdsenseLoader } from "@/components/adsense";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Saanwariya Seth Fashion | Indian Fashion, Everyday Style", template: "%s | Saanwariya Seth Fashion" },
  description: "Explore sarees, suits, jewellery, watches, bags, footwear and lifestyle finds at Saanwariya Seth Fashion. Discover curated collections and helpful style edits.",
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteConfig.url, siteName: siteConfig.name, title: "Saanwariya Seth Fashion", description: "Indian fashion and lifestyle collections, thoughtfully brought together." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-IN"><body><Providers><AdsenseLoader/><SiteHeader/><main>{children}</main><SiteFooter/><ChatWidget/><SalePopup/></Providers></body></html>;
}
