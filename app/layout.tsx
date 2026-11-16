import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SalePopup } from "@/components/sale-popup";
import { ChatWidget } from "@/components/chat-widget";
import { AdsenseLoader } from "@/components/adsense";
import { siteConfig } from "@/lib/site-config";
import { WebMcpTools } from "@/components/webmcp-tools";

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
  return <html lang="en-IN">
    <head>
      <link rel="ai-catalog" href={`${siteConfig.url}/.well-known/ai-catalog.json`} />
      <link rel="alternate" type="text/markdown" href={`${siteConfig.url}/home.md`} />
      <link rel="mcp-server-card" type="application/mcp-server-card+json" href={`${siteConfig.url}/api/mcp/server-card`} />
    </head>
    <body>
      <Providers>
        <AdsenseLoader />
        <WebMcpTools />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ChatWidget />
        <SalePopup />
      </Providers>
    </body>
  </html>;
}
