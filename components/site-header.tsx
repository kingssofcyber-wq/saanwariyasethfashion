"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, UserRound, Truck, ShieldCheck, Headset, Menu, X, ChevronDown, Heart, ArrowLeftRight } from "lucide-react";
import { useStore } from "@/components/providers";

const nav = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/about" },
  { label: "Style Edits", href: "/shop" },
  { label: "Sarees", href: "/shop?category=Sarees" },
  { label: "Suits", href: "/shop?category=Suits%20%26%20Sets" },
  { label: "Style Journal", href: "/style-journal" },
];

export function SiteHeader() {
  const { items, compare } = useStore();
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState("");
  const [mobile, setMobile] = useState(false);
  const [more, setMore] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setMobile(false);
  }

  return (
    <>
      <div className="ss-topbar">
        <div className="ss-topbar-inner">
          <div className="ss-promises">
            <span><Truck size={16} /> Free Shipping on Orders Above ₹999</span>
            <i />
            <span><ShieldCheck size={17} /> Secure Payments</span>
            <i />
            <span><Headset size={17} /> 24x7 Support</span>
          </div>
          <div className="ss-quick-links">
            <Link href="/account">My Account</Link>
            <Link href="/orders">Track Order</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>
      </div>

      <header className="ss-header">
        <div className="ss-header-inner">
          <button className="ss-mobile-toggle" aria-label={mobile ? "Close menu" : "Open menu"} onClick={() => setMobile(!mobile)}>
            {mobile ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="ss-brand" aria-label="Saanwariya Seth Fashion home">
            <img src="/brand/saanwariya-seth-fashion-logo.svg" alt="Saanwariya Seth Fashion" />
          </Link>

          <nav className={`ss-nav ${mobile ? "ss-nav-open" : ""}`} aria-label="Main navigation">
            {nav.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setMobile(false)} className={path === item.href && item.href === "/" ? "active" : ""}>
                {item.label}{item.label === "Style Edits" ? <ChevronDown size={13} /> : null}
              </Link>
            ))}
            <div className="ss-more-wrap">
              <button className="ss-more-button" onClick={() => setMore(!more)} aria-expanded={more}>More <ChevronDown size={13} /></button>
              {more && <div className="ss-more-menu">
                <Link href="/shop?category=Jewellery" onClick={() => { setMore(false); setMobile(false); }}>Jewellery</Link>
                <Link href="/shop?category=Watches" onClick={() => { setMore(false); setMobile(false); }}>Watches</Link>
                <Link href="/shop?category=Bags" onClick={() => { setMore(false); setMobile(false); }}>Bags &amp; Accessories</Link>
                <Link href="/shop/marketplace" onClick={() => { setMore(false); setMobile(false); }}>Marketplace Picks</Link>
                <Link href="/style-journal" onClick={() => { setMore(false); setMobile(false); }}>Style Journal</Link>
                <Link href="/admin" onClick={() => { setMore(false); setMobile(false); }}>Admin Portal ↗</Link>
              </div>}
            </div>
          </nav>

          <form className="ss-search" onSubmit={search} role="search">
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search for products..." aria-label="Search products" />
            <button type="submit" aria-label="Search"><Search size={22} /></button>
          </form>

          <div className="ss-header-actions">
            <Link href="/wishlist" aria-label="Wishlist" className="ss-wish-link"><Heart size={22} /></Link>
            <Link href="/compare" aria-label={`Compare products, ${compare.length} selected`} className="ss-compare-link"><ArrowLeftRight size={21}/>{compare.length > 0 && <i>{compare.length}</i>}</Link>
            <Link href="/cart" aria-label={`Shopping cart, ${count} items`} className="ss-cart-link">
              <ShoppingCart size={27} />
              <span>{count}</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
