import Link from "next/link";
import { Instagram, Facebook, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return <footer className="ss-footer">
    <div className="container ss-footer-grid">
      <div className="ss-footer-brand"><Link href="/" aria-label="Saanwariya Seth Fashion home"><img src="/brand/saanwariya-seth-fashion-logo.svg" alt="Saanwariya Seth Fashion" /></Link><p>Celebrating timeless Indian style with sarees, suits, jewellery and little finds for every occasion.</p><div className="ss-socials"><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#facebook" aria-label="Facebook"><Facebook /></a></div></div>
      <div><h4>Shop</h4><Link href="/shop">All Products</Link><Link href="/shop?category=Sarees">Sarees</Link><Link href="/shop?category=Suits%20%26%20Sets">Suits &amp; Kurtis</Link><Link href="/shop?category=Jewellery">Jewellery</Link><Link href="/shop?category=Watches">Watches</Link><Link href="/shop?category=Accessories">Accessories</Link></div>
      <div><h4>Customer Care</h4><Link href="/about">Our Story</Link><Link href="/contact">Contact Us</Link><Link href="/faq">FAQs</Link><Link href="/shipping-returns">Shipping &amp; Returns</Link><Link href="/orders">Track Order</Link><Link href="/account">My Account</Link></div>
      <div><h4>Get in Touch</h4><p className="ss-footer-contact"><Mail /> support@saanwariyasethfashion.com</p><p className="ss-footer-contact"><Phone /> +91 8760670005</p><p className="ss-footer-contact"><MapPin /> India</p><Link href="/admin" className="ss-admin-link">Admin Portal <ArrowUpRight size={14} /></Link></div>
    </div>
    <div className="container ss-footer-bottom"><span>© {new Date().getFullYear()} Saanwariya Seth Fashion. All rights reserved.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/shipping-returns">Returns</Link></div><span>Made with care in India.</span></div>
  </footer>;
}
