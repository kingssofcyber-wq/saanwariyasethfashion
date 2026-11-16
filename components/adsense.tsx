"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7776844434912624";
const slots = {
  homeTop: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP || "",
  homeMid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID || "",
  shopTop: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHOP_TOP || "",
  shopInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHOP_INLINE || "",
  productBottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_BOTTOM || "",
  content: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT || "",
};
export type AdSlotKey = keyof typeof slots;

declare global {
  interface Window { adsbygoogle?: Array<Record<string, unknown>>; }
}

export function AdsenseLoader() {
  if (!/^ca-pub-\d{16}$/.test(clientId)) return null;
  return <Script
    id="google-adsense"
    async
    strategy="afterInteractive"
    crossOrigin="anonymous"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
    onReady={() => window.dispatchEvent(new Event("saanwariya-adsense-ready"))}
  />;
}

export function AdUnit({ slotKey, label = "Advertisement", className = "" }: { slotKey: AdSlotKey; label?: string; className?: string }) {
  const element = useRef<HTMLModElement | null>(null);
  const slotId = slots[slotKey];

  useEffect(() => {
    if (!clientId || !slotId) return;
    const showAd = () => {
      const node = element.current;
      if (!node || !window.adsbygoogle || node.dataset.adsbygoogleStatus) return;
      try { window.adsbygoogle.push({}); } catch { /* AdSense may reject an already-filled slot; do not break the page. */ }
    };
    window.addEventListener("saanwariya-adsense-ready", showAd);
    if (window.adsbygoogle) showAd();
    return () => window.removeEventListener("saanwariya-adsense-ready", showAd);
  }, [slotId]);

  return <div className={`ad-slot-wrap ${className}`} aria-label={label}>
    <span className="ad-slot-label">{label}</span>
    {clientId && slotId ? <ins
      ref={element}
      className="adsbygoogle ad-slot"
      style={{ display: "block", minHeight: 90 }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    /> : <div className="ad-slot-placeholder"><span>Advertisement</span></div>}
  </div>;
}
