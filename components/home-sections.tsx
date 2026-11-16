import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, Truck, ShieldCheck, Headset, BadgePercent, Star, RotateCcw, Gem, Gift, Instagram } from "lucide-react";
import { categories, type Product } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

const homeCategories = [
  { name: "Sarees", image: categories[0].image, href: "/shop?category=Sarees" },
  { name: "Suits", image: categories[1].image, href: "/shop?category=Suits%20%26%20Sets" },
  { name: "Kurtis", image: "/images/kurtis-category.webp", href: "/shop?category=Suits%20%26%20Sets" },
  { name: "Lehengas", image: "/images/lehenga-category.webp", href: "/shop?category=Sarees" },
  { name: "Ethnic Wear", image: "/images/ethnic-wear-category.webp", href: "/shop?category=Sarees" },
  { name: "Jewellery", image: categories[2].image, href: "/shop?category=Jewellery" },
  { name: "Accessories", image: categories[8].image, href: "/shop?category=Accessories" },
];

export function Hero() {
  return <section className="ss-hero" aria-label="Saanwariya Seth Fashion featured collection">
    <img className="ss-hero-image" src="/images/hero-saree.webp" alt="Model wearing a burgundy embroidered saree in a warm heritage-inspired setting" />
    <div className="ss-hero-shade" />
    <div className="ss-hero-copy">
      <div className="ss-ornament"><span /> <img src="/brand/saanwariya-lotus-mark.svg" alt="" /> <span /></div>
      <p className="ss-welcome">Welcome to <strong>Saanwariya Seth Fashion</strong></p>
      <h1>Style that feels like <em>you.</em></h1>
      <p className="ss-hero-description">Discover premium ethnic wear — Sarees, Suits, Kurtis and more,<br className="desktop-only" /> crafted for the modern Indian woman.</p>
      <Link href="/shop" className="ss-primary-button">Shop Now <ArrowRight size={20} /></Link>
    </div>
    <aside className="ss-hero-perks" aria-label="Collection highlights">
      <div><Gem /><b>Premium<br />Quality</b></div>
      <div><span className="ss-dress-icon">♙</span><b>Trendy<br />Designs</b></div>
      <div><Gift /><b>Perfect for<br />Every Occasion</b></div>
    </aside>
    <div className="ss-hero-dots"><span className="active" /><span /><span /></div>
  </section>;
}

export function MarqueeStrip() {
  const phrases = ["SPECIAL OFFER: FLAT 50% OFF ON SELECTED ETHNIC WEAR", "FREE SHIPPING ACROSS INDIA", "NEW SEASON · NEW YOU", "SHOP YOUR FAVOURITE LOOKS"];
  return <div className="ss-marquee" aria-label="Store offers"><div className="ss-marquee-track">{[...phrases, ...phrases, ...phrases].map((phrase, index) => <span key={index}>✦ {phrase} <b>✧</b></span>)}</div></div>;
}

export function CategorySection() {
  return <section className="ss-category-section">
    <div className="ss-section-title"><span /> <h2>Shop by Category</h2> <span /></div>
    <div className="ss-category-grid">{homeCategories.map((category) => <Link href={category.href} className="ss-category-card" key={category.name}>
      <div className="ss-category-image"><img src={category.image} alt={`${category.name} collection`} loading="lazy" /></div>
      <div className="ss-category-label">{category.name} <ArrowRight size={16} /></div>
    </Link>)}</div>
  </section>;
}

export function PromoCollections() {
  return <section className="ss-promo-grid" aria-label="Featured collections">
    <Link href="/shop?category=Sarees" className="ss-promo ss-promo-maroon">
      <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1100&q=90" alt="Red festive saree collection" loading="lazy" />
      <span className="ss-promo-copy"><b>THE SAREE EDIT</b><strong>Traditional Elegance<br />for Every You</strong><i>Explore Sarees <ArrowRight size={17} /></i></span>
    </Link>
    <Link href="/shop?category=Suits%20%26%20Sets" className="ss-promo ss-promo-green">
      <img src="/images/suits-gallery-02.webp" alt="Teal embroidered suit collection" loading="lazy" />
      <span className="ss-promo-copy"><b>THE SUIT EDIT</b><strong>Grace in<br />Every Thread</strong><i>Explore Suits <ArrowRight size={17} /></i></span>
    </Link>
    <Link href="/shop?category=Suits%20%26%20Sets" className="ss-promo ss-promo-peach">
      <img src="/images/kurtis-category.webp" alt="Pink kurti collection" loading="lazy" />
      <span className="ss-promo-copy"><b>THE KURTI EDIT</b><strong>Stay Stylish<br />Always</strong><i>Explore Kurtis <ArrowRight size={17} /></i></span>
    </Link>
  </section>;
}

export function FeaturedSection({ products }: { products: Product[] }) {
  return <section className="section container featured-section ss-featured">
    <div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Customer <i>favourites.</i></h2><p className="section-sub">Beautiful finds to make every moment feel a little more special.</p></div><Link href="/shop" className="text-link">Shop all products <ArrowRight size={16} /></Link></div>
    <ProductGrid products={products.slice(0, 8)} />
  </section>;
}

export function NewArrivalsSection({ products }: { products: Product[] }) {
  return <section className="section container arrivals-section ss-arrivals">
    <div className="section-heading"><div><span className="eyebrow">FRESH FROM THE STYLE HOUSE</span><h2>New <i>Arrivals.</i></h2><p className="section-sub">The latest pieces, picked to inspire your next look.</p></div><Link href="/shop?sort=latest" className="text-link">View new arrivals <ArrowRight size={16} /></Link></div>
    <ProductGrid products={products.slice(8, 16)} />
  </section>;
}

export function SaleFeature() {
  return <section className="ss-sale-feature">
    <div className="ss-sale-copy"><span>THE FESTIVE STYLE EVENT</span><h2>A little more<br /><em>beautiful.</em></h2><p>Explore selected styles and discover something special for every occasion.</p><Link href="/shop?sort=price-low" className="ss-light-button">Explore Sale <ArrowRight size={17} /></Link></div>
    <div className="ss-sale-art"><img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1100&q=90" alt="Elegant accessories for every occasion" loading="lazy"/><div className="ss-sale-badge">SPECIAL<br /><strong>SALE</strong><small>STYLE EDIT</small></div></div>
  </section>;
}

export function EditorialBanner() {
  return <section className="ss-editorial-banner">
    <div className="ss-editorial-photo"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=90" alt="Fashion editorial collection" loading="lazy" /></div>
    <div className="ss-editorial-copy"><span>SAANWARIYA SETH FASHION</span><h2>Tradition, with<br /><em>a modern soul.</em></h2><p>Celebrate your own style with thoughtful collections made for moments big and small.</p><Link href="/shop" className="ss-primary-button">Explore the Collection <ArrowRight size={18} /></Link></div>
  </section>;
}

export function MarketplaceBanner() {
  return <section className="ss-marketplace container">
    <div className="ss-marketplace-copy"><span>MORE CHOICE, ONE PLACE</span><h2>Marketplace <em>Picks</em></h2><p>Discover selected Flipkart marketplace links alongside the Saanwariya collection.</p><Link href="/shop/marketplace" className="ss-primary-button">Explore Marketplace <ArrowUpRight size={18} /></Link><small>External marketplace purchases are completed on the seller's website.</small></div>
    <div className="ss-marketplace-products"><span>STYLE FINDS</span><div><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=420&q=85" alt="Watch product" loading="lazy"/><img src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=420&q=85" alt="Jewellery product" loading="lazy"/><img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=420&q=85" alt="Handbag product" loading="lazy"/></div></div>
  </section>;
}

export function TrustStrip() {
  return <section className="ss-trust-strip">
    <div><Truck /><span><b>Free Shipping</b><small>On Orders Above ₹999</small></span></div>
    <div><ShieldCheck /><span><b>Secure &amp; Trusted</b><small>Shopping Experience</small></span></div>
    <div><Headset /><span><b>24x7 Customer Support</b><small>+91 8760670005</small></span></div>
    <div><RotateCcw /><span><b>Easy Returns</b><small>(within 2 Days*)</small></span></div>
  </section>;
}

export function ClosingNote() {
  return <section className="ss-closing"><div className="ss-closing-flower">✿</div><span>THANK YOU FOR VISITING</span><h2>Find a little joy in <em>every detail.</em></h2><p>Thank you for being part of the Saanwariya Seth Fashion story.</p><Link href="/shop" className="ss-primary-button">Shop the Collection <ArrowRight size={17} /></Link></section>;
}
