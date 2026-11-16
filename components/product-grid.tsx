import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { AdUnit } from "@/components/adsense";

export function ProductGrid({ products, inlineAd = false }: { products: Product[]; inlineAd?: boolean }) {
  if (!products.length) return <div className="empty-state"><span>✦</span><h3>No finds just yet</h3><p>Try another search or explore all our collections.</p></div>;
  if (!inlineAd || products.length < 10) return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>;
  return <>
    <div className="product-grid">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product}/>)}</div>
    <AdUnit slotKey="shopInline" className="ad-slot-inline"/>
    <div className="product-grid">{products.slice(8).map((product) => <ProductCard key={product.id} product={product}/>)}</div>
  </>;
}
