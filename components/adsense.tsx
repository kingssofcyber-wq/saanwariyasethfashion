"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Publisher and ad-unit IDs are public identifiers. Never put private credentials here.
const DEFAULT_ADSENSE_CLIENT_ID = "ca-pub-7776844434912624";
const configuredClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "";
const clientId = /^ca-pub-\d{16}$/.test(configuredClientId)
  ? configuredClientId
  : DEFAULT_ADSENSE_CLIENT_ID;
const isValidClientId = /^ca-pub-\d{16}$/.test(clientId);
const ADSENSE_READY_EVENT = "saanwariya-adsense-ready";

// The supplied responsive ad-unit ID is used as the default at every existing
// placement across the store.
const DEFAULT_AD_SLOT_ID = "8943400841";
// The publisher supplied one responsive ad unit to use at every placement.
// Keep the slot ID centralised so existing and future placements stay consistent.
const slots = {
  homeTop: DEFAULT_AD_SLOT_ID,
  homeMid: DEFAULT_AD_SLOT_ID,
  shopTop: DEFAULT_AD_SLOT_ID,
  shopInline: DEFAULT_AD_SLOT_ID,
  productBottom: DEFAULT_AD_SLOT_ID,
  content: DEFAULT_AD_SLOT_ID,
};

export type AdSlotKey = keyof typeof slots;

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/** Loads Google's AdSense library once for the whole application. */
export function AdsenseLoader() {
  if (!isValidClientId) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      onReady={() => {
        // A block body intentionally returns void. Next.js Script's onReady
        // callback must not return the boolean from dispatchEvent().
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event(ADSENSE_READY_EVENT));
        }
      }}
    />
  );
}

type AdUnitProps = {
  slotKey: AdSlotKey;
  label?: string;
  className?: string;
};

/** Responsive ad placement. If no slot ID is configured, show a placeholder. */
export function AdUnit({
  slotKey,
  label = "Advertisement",
  className = "",
}: AdUnitProps) {
  const element = useRef<HTMLModElement | null>(null);
  const slotId = slots[slotKey];
  const hasConfiguredSlot = isValidClientId && /^\d+$/.test(slotId);

  useEffect(() => {
    if (!hasConfiguredSlot) {
      return;
    }

    const requestAd = (): void => {
      const node = element.current;

      if (!node) {
        return;
      }

      // Avoid requesting the same slot twice during remounts or effect replay.
      if (node.dataset.adRequested === "true" || node.dataset.adsbygoogleStatus) {
        return;
      }

      const adsQueue = (window.adsbygoogle = window.adsbygoogle || []);
      node.dataset.adRequested = "true";

      try {
        adsQueue.push({});
      } catch (error) {
        // A rejected slot should not break the page. Allow another attempt if
        // the Google library is ready again later.
        delete node.dataset.adRequested;
        console.warn("AdSense could not fill this slot:", error);
      }
    };

    window.addEventListener(ADSENSE_READY_EVENT, requestAd);

    // Handles the case where the script loaded before this slot mounted.
    if (window.adsbygoogle) {
      requestAd();
    }

    return () => {
      window.removeEventListener(ADSENSE_READY_EVENT, requestAd);
    };
  }, [hasConfiguredSlot, slotId]);

  return (
    <div className={`ad-slot-wrap ${className}`.trim()} aria-label={label}>
      <span className="ad-slot-label">{label}</span>
      {hasConfiguredSlot ? (
        <ins
          ref={element}
          className="adsbygoogle ad-slot"
          style={{ display: "block", minHeight: 90 }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-slot-placeholder">
          <span>Advertisement</span>
        </div>
      )}
    </div>
  );
}
