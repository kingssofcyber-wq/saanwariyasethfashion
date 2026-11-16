"use client";

import { useEffect, useState } from "react";
import { type Product, categories, money } from "@/lib/catalog";
import { Check, Eye, Package, Plus, RefreshCw, ShoppingBag, Star, Trash2 } from "lucide-react";

const blank = { name: "", brand: "", category: "Sarees", description: "", price: "", mrp: "", image: "", stock: "10", featured: false };
type AdminReview = { id: string; rating: number; title: string; comment: string; approved: boolean; createdAt: string; product: { name: string; slug: string }; user: { name: string; email: string } };

export function AdminDashboard() {
  const [tab, setTab] = useState<"products" | "orders" | "reviews">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() { const response = await fetch("/api/products"); const data = await response.json(); setProducts(data.products || []); }
  async function loadOrders() { const response = await fetch("/api/admin/orders"); const data = await response.json(); setOrders(data.orders || []); }
  async function loadReviews() { const response = await fetch("/api/admin/reviews"); const data = await response.json(); setReviews(data.reviews || []); }
  useEffect(() => { load(); loadOrders(); loadReviews(); }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setForm(blank); setMessage("Product saved successfully."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save product."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) { if (!confirm("Hide this product from the storefront?")) return; const response = await fetch(`/api/products/${id}`, { method: "DELETE" }); if (response.ok) load(); else setMessage("Could not update product."); }
  async function updateStatus(id: string, status: string) { const response = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (response.ok) loadOrders(); else setMessage("Could not update order status."); }
  async function moderateReview(id: string, approved: boolean) { const response = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) }); if (response.ok) loadReviews(); else setMessage("Could not update review."); }
  async function deleteReview(id: string) { if (!confirm("Delete this review permanently?")) return; const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }); if (response.ok) loadReviews(); }

  return <>
    <div className="admin-tabs">
      <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}><ShoppingBag size={16}/> Products ({products.length})</button>
      <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}><Package size={16}/> Orders ({orders.length})</button>
      <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}><Star size={16}/> Reviews ({reviews.filter((review) => !review.approved).length} pending)</button>
    </div>
    {tab === "products" ? <div className="admin-layout">
      <form className="admin-form" onSubmit={create}>
        <div className="admin-form-title"><div><span className="eyebrow">CATALOGUE</span><h3>Add a product</h3></div><Plus/></div>
        <label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label>
        <div className="form-grid">
          <label>Brand<input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })}/></label>
          <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category.slug}>{category.name}</option>)}</select></label>
          <label>Selling price (₹)<input type="number" min="1" required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })}/></label>
          <label>MRP (₹)<input type="number" min="1" required value={form.mrp} onChange={(event) => setForm({ ...form, mrp: event.target.value })}/></label>
          <label>Stock<input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })}/></label>
          <label className="span-2">Image URL<input required type="url" placeholder="https://…" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })}/></label>
        </div>
        <label>Description<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}/></label>
        <label className="check-label"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })}/> Feature on homepage</label>
        {message && <p className="admin-message">{message}</p>}
        <button className="btn btn-dark full-btn" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
      </form>
      <section className="admin-products"><div className="admin-form-title"><div><span className="eyebrow">INVENTORY</span><h3>Products ({products.length})</h3></div><button className="icon-btn" onClick={load}><RefreshCw size={17}/></button></div><div className="admin-table">{products.map((product) => <div className="admin-row" key={product.id}><img src={product.image} alt=""/><div><b>{product.name}</b><small>{product.category} · {product.stock} in stock</small></div><strong>{money(product.price)}</strong><button onClick={() => remove(product.id)} aria-label="Hide product"><Trash2 size={16}/></button></div>)}</div></section>
    </div> : tab === "orders" ? <section className="admin-products order-admin"><div className="admin-form-title"><div><span className="eyebrow">ORDER MANAGEMENT</span><h3>Recent orders</h3></div><button className="icon-btn" onClick={loadOrders}><RefreshCw size={17}/></button></div>{orders.length ? orders.map((order) => <div className="admin-order" key={order.id}><div><b>{order.orderNumber}</b><small>{order.fullName} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</small><small>{order.items.map((item: any) => `${item.productName} × ${item.quantity}`).join(" · ")}</small></div><strong>{money(order.total)}</strong><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}><option>PLACED</option><option>CONFIRMED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select></div>) : <p className="section-sub">No orders have been placed yet.</p>}</section> : <section className="admin-products"><div className="admin-form-title"><div><span className="eyebrow">CUSTOMER FEEDBACK</span><h3>Review moderation</h3></div><button className="icon-btn" onClick={loadReviews}><RefreshCw size={17}/></button></div>{reviews.length ? reviews.map((review) => <article className="admin-review-row" key={review.id}><div><div className="pdp-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><b>{review.title}</b><p>{review.comment}</p><small>{review.user.name} ({review.user.email}) · {review.product.name} · {new Date(review.createdAt).toLocaleDateString("en-IN")}</small><span className={review.approved ? "admin-review-approved" : "admin-review-pending"}>{review.approved ? "Published" : "Pending approval"}</span></div><div className="admin-review-actions">{!review.approved && <button className="btn btn-dark" onClick={() => moderateReview(review.id, true)}><Check size={14}/> Approve</button>}{review.approved && <button className="btn btn-outline" onClick={() => moderateReview(review.id, false)}><Eye size={14}/> Unpublish</button>}<button className="icon-btn" onClick={() => deleteReview(review.id)} aria-label="Delete review"><Trash2 size={16}/></button></div></article>) : <p className="section-sub">No customer reviews have been submitted yet.</p>}</section>}
  </>;
}
