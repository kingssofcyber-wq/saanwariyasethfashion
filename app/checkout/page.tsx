"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "@/components/providers";
import { money } from "@/lib/catalog";
import { useRouter } from "next/navigation";
import { BadgePercent, CheckCircle2, ShieldCheck, Truck, X } from "lucide-react";

type CheckoutUser = { id: string; name: string; email: string } | null;
type AppliedCoupon = { code: string; discount: number };

export default function CheckoutPage() {
  const { items, clear } = useStore();
  const router = useRouter();
  const [user, setUser] = useState<CheckoutUser>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [shippingFee, setShippingFee] = useState(79);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "" });

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.json()).then((data) => {
      setUser(data.user || null);
      if (data.user) setForm((current) => ({ ...current, fullName: data.user.name, email: data.user.email }));
    }).catch(() => setUser(null));
    fetch("/api/storefront/settings").then((response) => response.json()).then((data) => {
      if (Number.isFinite(Number(data.shippingFee))) setShippingFee(Number(data.shippingFee));
      if (Number.isFinite(Number(data.freeShippingThreshold))) setFreeShippingThreshold(Number(data.freeShippingThreshold));
    }).catch(() => undefined);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingFee;
  const discount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discount) : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  async function applyCoupon() {
    setCouponBusy(true); setCouponError("");
    try {
      const response = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponInput, subtotal }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Coupon could not be applied.");
      setAppliedCoupon({ code: data.coupon.code, discount: Number(data.discount) });
      setCouponError("");
    } catch (reason) {
      setAppliedCoupon(null);
      setCouponError(reason instanceof Error ? reason.message : "Coupon could not be applied.");
    } finally { setCouponBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map((item) => ({ id: item.product.id, quantity: item.quantity })), couponCode: appliedCoupon?.code || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not place order.");
      clear();
      router.push(`/orders?placed=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return <div className="container page-wrap">
    <div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/cart">Bag</Link> / <span>Checkout</span></div>
    <div className="page-title-row"><div><span className="eyebrow">ALMOST YOURS</span><h1>Secure <i>checkout.</i></h1></div></div>
    {!items.length ? <div className="empty-state"><h3>Your bag is empty</h3><Link href="/shop" className="btn btn-dark">Browse products</Link></div> : !user ? <div className="login-gate"><h3>Sign in to continue</h3><p>Your order will be saved to your account so you can track it later.</p><Link href="/login?next=/checkout" className="btn btn-dark">Sign in / Create account</Link></div> : <div className="checkout-layout">
      <form className="checkout-form" onSubmit={submit}>
        <h3>Delivery details</h3>
        <div className="form-grid">
          <label>Full name<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })}/></label>
          <label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })}/></label>
          <label>Phone number<input required type="tel" pattern="[0-9+ -]{10,15}" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })}/></label>
          <label>PIN code<input required inputMode="numeric" pattern="[0-9]{6}" value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })}/></label>
          <label className="span-2">Full address<textarea required rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })}/></label>
          <label>City<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}/></label>
          <label>State<input required value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}/></label>
        </div>
        <h3 className="payment-title">Payment method</h3>
        <div className="payment-option"><span className="radio-dot"/><div><b>Cash on Delivery</b><small>Pay when your order arrives</small></div><span>COD</span></div>
        <p className="secure-note">Your information is used to process and deliver this order. Checkout currently supports Cash on Delivery.</p>
        {error && <p className="form-error">{error}</p>}
        <button disabled={busy} className="btn btn-dark full-btn">{busy ? "Placing order…" : `Place order · ${money(total)}`}</button>
      </form>
      <aside className="summary-card">
        <h3>Your order</h3>
        {items.map((item) => <div className="checkout-mini" key={item.product.id}><img src={item.product.image} alt=""/><span>{item.product.name} × {item.quantity}</span><b>{money(item.product.price * item.quantity)}</b></div>)}
        <div className="sa-checkout-coupon"><label htmlFor="checkout-coupon"><BadgePercent size={16}/> Have a coupon?</label><div><input id="checkout-coupon" value={couponInput} onChange={(event) => setCouponInput(event.target.value.toUpperCase())} placeholder="Enter code" disabled={Boolean(appliedCoupon)}/>{appliedCoupon ? <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(""); setCouponError(""); }}><X size={14}/> Remove</button> : <button type="button" onClick={() => void applyCoupon()} disabled={couponBusy || !couponInput.trim()}>{couponBusy ? "Checking…" : "Apply"}</button>}</div>{couponError && <small className="sa-coupon-error">{couponError}</small>}{appliedCoupon && <small className="sa-coupon-success"><CheckCircle2 size={13}/> {appliedCoupon.code} applied successfully</small>}</div>
        <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
        <div><span>Shipping</span><b>{shipping ? money(shipping) : "Free"}</b></div>
        {discount > 0 && <div className="sa-summary-discount"><span>Coupon discount</span><b>−{money(discount)}</b></div>}
        <div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>
        <small className="sa-shipping-hint"><Truck size={13}/> {freeShippingThreshold > 0 ? `Free shipping on orders above ${money(freeShippingThreshold)}.` : "Free shipping available."}</small>
        <small className="sa-secure-hint"><ShieldCheck size={13}/> Your checkout is protected.</small>
      </aside>
    </div>}
  </div>;
}
