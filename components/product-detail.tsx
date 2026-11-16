"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { money, getProductGalleryImages, resolveProductImage } from "@/lib/catalog";
import { useStore } from "@/components/providers";
import { ProductGrid } from "@/components/product-grid";

type Review = { id: string; rating: number; title: string; comment: string; createdAt: string; user: { name: string } };
type ReviewSummary = { rating: number; count: number; reviews: Review[] };

export function ProductDetail({ product: p, similar = [], reviewSummary }: { product: Product; similar?: Product[]; reviewSummary: ReviewSummary }) {
  const { add, wishlist, toggleWish } = useStore();
  const router = useRouter();
  const galleryImages = getProductGalleryImages(p);
  const [activeImage, setActiveImage] = useState(galleryImages[0] || resolveProductImage(p));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const saved = wishlist.includes(p.id);
  const discount = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const isMarketplace = p.source === "FLIPKART";

  function addToBag() { for (let index = 0; index < qty; index++) add(p); setAdded(true); }
  function buyNow() {
    if (isMarketplace && p.externalUrl) { window.open(p.externalUrl, "_blank", "noopener,noreferrer"); return; }
    addToBag(); router.push("/checkout");
  }
  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setReviewBusy(true); setReviewMessage("");
    try {
      const response = await fetch(`/api/products/${p.id}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, title: reviewTitle, comment: reviewComment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit review.");
      setReviewMessage(data.message); setReviewTitle(""); setReviewComment("");
    } catch (error) { setReviewMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setReviewBusy(false); }
  }

  return <>
    <section className="pdp-layout">
      <div className="pdp-gallery">
        <div className="pdp-main-image"><img src={activeImage} alt={`${p.name} — selected product view`} onError={(event) => { event.currentTarget.src = p.category === "Suits & Sets" ? "/images/suits-category.webp" : "/brand/saanwariya-seth-fashion-logo.svg"; }}/><span className="pdp-image-stamp">SAANWARIYA SELECT</span><span className="pdp-image-count"><ImageIcon size={13}/> {galleryImages.indexOf(activeImage) + 1} / {galleryImages.length}</span></div>
        <div className="pdp-thumbnails" aria-label="More product images">
          {galleryImages.map((image, index) => <button type="button" key={`${image}-${index}`} className={activeImage === image ? "is-active" : ""} onClick={() => setActiveImage(image)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === image}><img src={image} alt={`${p.name} view ${index + 1}`} loading="lazy" onError={(event) => { event.currentTarget.src = p.category === "Suits & Sets" ? "/images/suits-category.webp" : "/brand/saanwariya-seth-fashion-logo.svg"; }}/></button>)}
        </div>
        <div className="pdp-image-note">Select a thumbnail to view another product image. Demo gallery images are illustrative; replace them with exact product photos before launch.</div>
      </div>
      <div className="pdp-summary">
        <span className="eyebrow">{p.category.toUpperCase()} · {p.brand.toUpperCase()}</span>
        <h1>{p.name}</h1>
        <div className="pdp-rating-line"><span className="pdp-rating-chip"><Star size={14} fill="currentColor"/> {reviewSummary.count ? reviewSummary.rating.toFixed(1) : "New"}</span><a href="#customer-reviews">{reviewSummary.count ? `${reviewSummary.count} verified review${reviewSummary.count === 1 ? "" : "s"}` : "Be the first to review"}</a><span className="pdp-sku">SKU · {p.slug.toUpperCase()}</span></div>
        <div className="pdp-price-block"><strong>{money(p.price)}</strong>{p.mrp > p.price && <><del>{money(p.mrp)}</del><span>{discount}% OFF</span></>}<small>Taxes and delivery charges, if applicable, are shown at checkout.</small></div>
        <p className="pdp-lead">{p.description}</p>
        <div className="pdp-stock-line"><span className={p.stock > 0 ? "stock-in" : "stock-out"}/>{p.stock > 0 ? `Available · ${p.stock} in stock` : "Currently unavailable"}</div>
        {!isMarketplace && <div className="pdp-purchase-row">
          <div className="pdp-quantity"><button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15}/></button><span>{qty}</span><button type="button" onClick={() => setQty((value) => Math.min(10, value + 1))} aria-label="Increase quantity"><Plus size={15}/></button></div>
          <button className="btn btn-dark pdp-add" type="button" onClick={addToBag} disabled={p.stock < 1}>{added ? <><Check size={17}/> Added to bag</> : <><ShoppingBag size={17}/> Add to cart</>}</button>
          <button className="btn pdp-buy" type="button" onClick={buyNow} disabled={p.stock < 1}>Buy now</button>
          <button className={`pdp-wishlist ${saved ? "saved" : ""}`} type="button" onClick={() => toggleWish(p.id)} aria-label="Toggle wishlist"><Heart size={19} fill={saved ? "currentColor" : "none"}/></button>
        </div>}
        {isMarketplace && <a className="btn btn-dark pdp-buy-market" href={p.externalUrl || "#"} target="_blank" rel="nofollow sponsored noopener noreferrer">Continue to Flipkart <Check size={17}/></a>}
        <div className="pdp-assurances"><div><Truck/><span><b>Delivery information</b><small>Serviceability and delivery estimate are confirmed at checkout.</small></span></div><div><ShieldCheck/><span><b>Secure shopping</b><small>Account and order details are protected by the store.</small></span></div><div><RotateCcw/><span><b>Returns &amp; exchanges</b><small>Eligibility and instructions are listed in our policy.</small></span></div></div>
        <div className="pdp-detail-accordions">
          <details open><summary>Product description</summary><p>{p.description}</p><p>Brand: {p.brand}. Category: {p.category}. Product availability is subject to stock confirmation when your order is processed.</p></details>
          <details><summary>Shipping and delivery</summary><p>Shipping charges and available delivery estimates are displayed during checkout. Read the <Link href="/shipping-returns">shipping policy</Link> for more information.</p></details>
          <details><summary>Returns and exchange</summary><p>Check the product page and order confirmation for the item’s return eligibility. Please contact customer care before sending an item back. See <Link href="/exchange-returns">exchange and return policy</Link>.</p></details>
        </div>
      </div>
    </section>

    <section className="pdp-reviews" id="customer-reviews">
      <div className="pdp-section-heading"><div><span className="eyebrow">REAL CUSTOMER FEEDBACK</span><h2>Ratings &amp; <i>reviews.</i></h2></div><div className="pdp-review-summary">{reviewSummary.count ? <><b><Star fill="currentColor" size={18}/> {reviewSummary.rating.toFixed(1)} / 5</b><small>Based on {reviewSummary.count} approved verified-purchase review(s)</small></> : <><b>No reviews yet</b><small>Be the first verified customer to share feedback.</small></>}</div></div>
      <div className="pdp-review-grid"><div className="pdp-review-list">{reviewSummary.reviews.length ? reviewSummary.reviews.map((review) => <article className="pdp-review-card" key={review.id}><div className="pdp-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><h3>{review.title}</h3><p>{review.comment}</p><small>{review.user.name} · Verified purchase · {new Date(review.createdAt).toLocaleDateString("en-IN")}</small></article>) : <div className="pdp-no-reviews">Customer reviews will appear here after verified-purchase reviews have been approved.</div>}</div>
        <form className="pdp-review-form" onSubmit={submitReview}><h3>Write a review</h3><p>Only customers with a delivered order for this product can submit a review. Reviews are checked before publication.</p><label>Your rating</label><div className="pdp-star-picker" role="group" aria-label="Select a rating">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} stars`} className={star <= rating ? "selected" : ""}>★</button>)}</div><label>Review title<input required minLength={3} maxLength={90} value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)}/></label><label>Your experience<textarea required minLength={12} maxLength={1800} rows={4} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)}/></label>{reviewMessage && <p className="pdp-review-message">{reviewMessage}</p>}<button className="btn btn-dark" disabled={reviewBusy}>{reviewBusy ? "Submitting…" : "Submit review"}</button></form>
      </div>
    </section>

    {similar.length > 0 && <section className="pdp-similar"><div className="pdp-section-heading"><div><span className="eyebrow">MORE TO EXPLORE</span><h2>Similar <i>finds.</i></h2></div><Link href={`/shop?category=${encodeURIComponent(p.category)}`} className="text-link">Shop this category <ArrowLeft size={15}/></Link></div><ProductGrid products={similar}/></section>}
  </>;
}
