"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SalePopup } from "@/components/sale-popup";
import { ChatWidget } from "@/components/chat-widget";
import { GlobalRouteAd } from "@/components/global-route-ad";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <div className="sa-admin-route">{children}</div>;

  return <>
    <SiteHeader />
    <main>{children}</main>
    <GlobalRouteAd />
    <SiteFooter />
    <ChatWidget />
    <SalePopup />
  </>;
}
