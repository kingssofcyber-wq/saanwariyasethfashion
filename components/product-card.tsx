"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, Heart, ArrowLeftRight, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { money, resolveProductImage } from "@/lib/catalog";
import { useStore } from "@/components/providers";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { add, wishlist, toggleWish, compare, toggleCompare } = useStore();
  const saved = wishlist.includes(product.id);
  const compared = compare.includes(product.id);
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const isMarketplace = product.source === "FLIPKART";

  function buyNow() {
    if (isMarketplace && product.externalUrl) {
      window.open(product.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    add(product);
    router.push("/checkout");
  }

  return <article className="product-card">
    <div className="product-image-wrap">
      <Link href={`/product/${product.slug}`} className="product-image" aria-label={`View ${product.name}`}>
        <img src={resolveProductImage(product)} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.src = product.category === "Suits & Sets" ? "/images/suits-category.webp" : "/brand/saanwariya-seth-fashion-logo.svg"; }} />
        <span className="product-badge">{isMarketplace ? "Marketplace pick" : discount >= 25 ? `${discount}% OFF` : product.featured ? "Curated pick" : "New find"}</span>
      </Link>
      <div className="product-quick-actions" aria-label="Product quick actions">
        <button className={`product-icon-action ${saved ? "is-active" : ""}`} onClick={() => toggleWish(product.id)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} title="Wishlist"><Heart size={16} fill={saved ? "currentColor" : "none"}/></button>
        <button className={`product-icon-action ${compared ? "is-active" : ""}`} onClick={() => toggleCompare(product.id)} aria-label={compared ? "Remove from compare" : "Compare product"} title="Compare"><ArrowLeftRight size={16}/></button>
        <Link className="product-icon-action" href={`/product/${product.slug}`} aria-label={`Quick view ${product.name}`} title="Quick view"><Eye size={16}/></Link>
      </div>
    </div>
    <div className="product-info">
      <span className="product-brand">{product.brand}</span>
      <Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link>
      <div className="product-price"><strong>{money(product.price)}</strong>{product.mrp > product.price && <><del>{money(product.mrp)}</del><em>{discount}% off</em></>}</div>
      <div className="product-card-cta">
        {isMarketplace ? <a className="product-add-btn product-market-btn" href={product.externalUrl || "#"} target="_blank" rel="nofollow sponsored noopener noreferrer">View on Flipkart <ArrowUpRight size={14}/></a> : <>
          <button className="product-add-btn" onClick={() => add(product)} disabled={product.stock < 1}><ShoppingCart size={14}/> Add to cart</button>
          <button className="product-buy-btn" onClick={buyNow} disabled={product.stock < 1}><Zap size={13}/> Buy now</button>
        </>}
      </div>
      <div className="product-card-foot"><span>{product.stock > 0 ? "In stock" : "Currently unavailable"}</span><Link href={`/product/${product.slug}`}>Details <ArrowUpRight size={12}/></Link></div>
    </div>
  </article>;
}
