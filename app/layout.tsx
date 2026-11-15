import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SalePopup } from "@/components/sale-popup";
import { ChatWidget } from "@/components/chat-widget";

// Hostinger environment variables must contain a complete URL, including
// https://. This normalization also tolerates a hostname entered without it.
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://saanwariyasethfashion.com";

const normalizedSiteUrl = /^https?:\/\//i.test(configuredSiteUrl)
  ? configuredSiteUrl
  : `https://${configuredSiteUrl}`;

export const metadata: Metadata = {
  title: "Saanwariya Seth Fashion | Discover Your Everyday Style",
  description:
    "Explore sarees, suits, jewellery, watches, bags, footwear and more at Saanwariya Seth Fashion.",
  metadataBase: new URL(normalizedSiteUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <ChatWidget />
          <SalePopup />
        </Providers>
      </body>
    </html>
  );
}