"use client";

import { usePathname } from "next/navigation";
import { AdUnit } from "@/components/adsense";

// Pages with an explicit, carefully positioned ad unit already in their page
// component. The global fallback must not add a second ad to these routes.
const ROUTES_WITH_PAGE_ADS = new Set([
  "/",
  "/shop",
  "/shop/marketplace",
  "/about",
  "/contact",
  "/cookie-policy",
  "/disclaimer",
  "/exchange-returns",
  "/faq",
  "/privacy",
  "/shipping-returns",
  "/style-journal",
  "/terms",
]);

// Do not show ads in account, authentication, order, checkout or admin flows.
// These are private or transactional pages, not general content destinations.
const PRIVATE_OR_TRANSACTIONAL_PREFIXES = [
  "/admin",
  "/login",
  "/register",
  "/account",
  "/cart",
  "/checkout",
  "/orders",
  "/wishlist",
  "/compare",
];

/** Adds one responsive ad to newly-created public pages unless that page has
 * its own explicit placement. This keeps future public routes monetizable
 * without duplicating ads on the existing homepage, shop or PDP templates.
 */
export function GlobalRouteAd() {
  const pathname = usePathname() || "/";
  const isPrivateOrTransactional = PRIVATE_OR_TRANSACTIONAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const isProductDetail = pathname.startsWith("/product/");

  if (isPrivateOrTransactional || isProductDetail || ROUTES_WITH_PAGE_ADS.has(pathname)) {
    return null;
  }

  return (
    <AdUnit
      key={pathname}
      slotKey="content"
      label="Advertisement"
      className="global-route-ad"
    />
  );
}
