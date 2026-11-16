import Link from "next/link";
import { ArrowUpRight, Heart, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return <footer className="ss-footer">
    <div className="container ss-footer-grid">
      <div className="ss-footer-brand">
        <Link href="/" aria-label="Saanwariya Seth Fashion home"><img src="/brand/saanwariya-seth-fashion-logo.svg" alt="Saanwariya Seth Fashion"/></Link>
        <p>Celebrating personal style with Indian ethnic wear, jewellery, accessories and thoughtful lifestyle finds. Browse clearly described collections and choose pieces that feel like you.</p>
        <Link href="/disclaimer" className="ss-affiliate-note">Marketplace &amp; affiliate disclosure</Link>
      </div>
      <div><h4>Shop</h4><Link href="/shop">All Products</Link><Link href="/shop?category=Sarees">Sarees</Link><Link href="/shop?category=Suits%20%26%20Sets">Suits &amp; Kurtis</Link><Link href="/shop?category=Jewellery">Jewellery</Link><Link href="/shop?category=Watches">Watches</Link><Link href="/shop?category=Accessories">Accessories</Link><Link href="/style-journal">Style Journal</Link></div>
      <div><h4>Customer Care</h4><Link href="/about">About Us</Link><Link href="/contact">Contact Us</Link><Link href="/faq">FAQs</Link><Link href="/shipping-returns">Shipping Policy</Link><Link href="/exchange-returns">Returns &amp; Exchanges</Link><Link href="/orders">Track Order</Link><Link href="/account">My Account</Link></div>
      <div><h4>Policies &amp; Information</h4><Link href="/privacy">Privacy Policy</Link><Link href="/cookie-policy">Cookie Policy</Link><Link href="/terms">Terms &amp; Conditions</Link><Link href="/disclaimer">Disclaimer</Link><p className="ss-footer-contact"><Mail/> <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a></p><p className="ss-footer-contact"><MapPin/> India</p><Link href="/admin" className="ss-admin-link">Admin Portal <ArrowUpRight size={14}/></Link></div>
    </div>
    <div className="container ss-footer-bottom"><span>© {new Date().getFullYear()} Saanwariya Seth Fashion. All rights reserved.</span><span>Product details and policies are provided on the relevant page.</span><span className="ss-made-by">Made with <Heart size={13} fill="currentColor" aria-label="love"/> by <strong>Mivaan Jangra</strong></span></div>
  </footer>;
}
