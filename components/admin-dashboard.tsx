"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BadgePercent, BarChart3,
  Bell, Check, CheckCircle2, ChevronDown, ChevronRight, CircleDollarSign,
  ClipboardList, Eye, EyeOff, Image as ImageIcon, LayoutDashboard, Mail,
  Menu, MessageSquare, Package, Pencil, Plus, RefreshCw, Search, Settings,
  ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Star,
  Store, Tags, Trash2, Truck, Users, X,
} from "lucide-react";
import { categories as defaultCategories, money, type Product } from "@/lib/catalog";

type Tab = "overview" | "products" | "inventory" | "orders" | "customers" | "categories" | "coupons" | "reviews" | "messages" | "banners" | "settings";
type AdminProduct = Product & { active: boolean; createdAt?: string; updatedAt?: string };
type Order = { id: string; orderNumber: string; fullName: string; email: string; phone: string; address: string; city: string; state: string; postalCode: string; paymentMethod?: string; discount?: number; couponCode?: string | null; total: number; status: string; createdAt: string; items: { productName: string; quantity: number; price: number }[] };
type Review = { id: string; rating: number; title: string; comment: string; approved: boolean; createdAt: string; product: { name: string; slug: string }; user: { name: string; email: string } };
type Customer = { id: string; name: string; email: string; createdAt: string; totalSpent: number; _count: { orders: number; reviews: number } };
type Category = { id: string; name: string; slug: string; description: string; image: string; active: boolean; sortOrder: number; productCount: number };
type Coupon = { id: string; code: string; description: string; discountType: string; value: number; minOrder: number; maxDiscount: number | null; usageLimit: number | null; usedCount: number; active: boolean; endsAt: string | null };
type Banner = { id: string; title: string; subtitle: string; image: string; href: string; position: string; active: boolean; sortOrder: number };
type Message = { id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: string };
type SettingsForm = { storeName: string; supportEmail: string; supportPhone: string; address: string; announcement: string; shippingFee: string; freeShippingThreshold: string; instagramUrl: string; facebookUrl: string; youtubeUrl: string };
type ProductForm = { name: string; brand: string; category: string; description: string; price: string; mrp: string; image: string; images: string; stock: string; featured: boolean; active: boolean; source: "OWN" | "FLIPKART"; externalUrl: string };
type SectionFailure = { label: string; endpoint: string; message: string };
type DatabaseDiagnostics = { adminAuthorized: boolean; databaseConnected: boolean | null; schemaReady: boolean | null; missingTables: string[]; missingColumns: string[]; code?: string; message?: string };

const blankProduct: ProductForm = { name: "", brand: "Saanwariya Select", category: "Sarees", description: "", price: "", mrp: "", image: "", images: "", stock: "10", featured: false, active: true, source: "OWN", externalUrl: "" };
const blankCategory = { name: "", description: "", image: "", sortOrder: "0" };
const blankCoupon = { code: "", description: "", discountType: "PERCENT", value: "10", minOrder: "0", maxDiscount: "", usageLimit: "" };
const blankBanner = { title: "", subtitle: "", image: "", href: "/shop", position: "HOME", sortOrder: "0" };
const blankSettings: SettingsForm = { storeName: "Saanwariya Seth Fashion", supportEmail: "support@saanwariyasethfashion.com", supportPhone: "", address: "", announcement: "", shippingFee: "79", freeShippingThreshold: "999", instagramUrl: "", facebookUrl: "", youtubeUrl: "" };

const navGroups: { label: string; items: { id: Tab; label: string; icon: typeof LayoutDashboard }[] }[] = [
  { label: "WORKSPACE", items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "products", label: "Products", icon: ShoppingBag }, { id: "inventory", label: "Inventory", icon: Package }, { id: "orders", label: "Orders", icon: ShoppingCart }] },
  { label: "CUSTOMERS & GROWTH", items: [{ id: "customers", label: "Customers", icon: Users }, { id: "categories", label: "Categories", icon: Tags }, { id: "coupons", label: "Coupons & offers", icon: BadgePercent }, { id: "reviews", label: "Reviews", icon: Star }, { id: "messages", label: "Messages", icon: MessageSquare }] },
  { label: "STORE DESIGN", items: [{ id: "banners", label: "Banners", icon: ImageIcon }, { id: "settings", label: "Store settings", icon: Settings }] },
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : `Request failed (${response.status})`;
    throw new Error(`HTTP ${response.status}: ${message}`);
  }
  return data as T;
}

function parseGallery(raw?: string | null): string[] {
  if (!raw) return [];
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.map(String) : []; }
  catch { return raw.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean); }
}

function StatCard({ label, value, helper, icon: Icon, tone = "orange" }: { label: string; value: string; helper: string; icon: typeof Package; tone?: "orange" | "green" | "blue" | "amber" }) {
  return <article className={`sa-stat-card tone-${tone}`}><span className="sa-stat-icon"><Icon size={19}/></span><span className="sa-stat-label">{label}</span><strong>{value}</strong><small>{helper}</small></article>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="sa-empty"><span><Package size={22}/></span><b>{title}</b><p>{text}</p></div>;
}

export function AdminDashboard({ adminName = "Store Admin" }: { adminName?: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<any>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<SettingsForm>(blankSettings);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [productForm, setProductForm] = useState<ProductForm>(blankProduct);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState(blankCategory);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState(blankCoupon);
  const [bannerForm, setBannerForm] = useState(blankBanner);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [failedSections, setFailedSections] = useState<SectionFailure[]>([]);
  const [databaseDiagnostics, setDatabaseDiagnostics] = useState<DatabaseDiagnostics | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true); setError(""); setFailedSections([]);
    const jobs = await Promise.allSettled([
      api<any>("/api/admin/overview"), api<{ products: AdminProduct[] }>("/api/admin/products"),
      api<{ orders: Order[] }>("/api/admin/orders"), api<{ customers: Customer[] }>("/api/admin/customers"),
      api<{ categories: Category[] }>("/api/admin/categories"), api<{ coupons: Coupon[] }>("/api/admin/coupons"),
      api<{ reviews: Review[] }>("/api/admin/reviews"), api<{ messages: Message[] }>("/api/admin/messages"),
      api<{ banners: Banner[] }>("/api/admin/banners"), api<{ settings: any }>("/api/admin/settings"),
    ] as const);
    const labels = ["Overview", "Products", "Orders", "Customers", "Categories", "Coupons", "Reviews", "Messages", "Banners", "Store settings"];
    const endpoints = ["/api/admin/overview", "/api/admin/products", "/api/admin/orders", "/api/admin/customers", "/api/admin/categories", "/api/admin/coupons", "/api/admin/reviews", "/api/admin/messages", "/api/admin/banners", "/api/admin/settings"];
    const failed = jobs.flatMap((job, index) => job.status === "rejected" ? [{
      label: labels[index], endpoint: endpoints[index],
      message: job.reason instanceof Error ? job.reason.message : String(job.reason || "Unknown request error"),
    }] : []);
    setFailedSections(failed);

    const diagnostics = await api<DatabaseDiagnostics>("/api/admin/diagnostics").catch((reason: unknown) => ({
      adminAuthorized: !(reason instanceof Error && /HTTP 401|HTTP 403/.test(reason.message)),
      databaseConnected: reason instanceof Error && /HTTP 401|HTTP 403/.test(reason.message) ? null : false,
      schemaReady: null, missingTables: [], missingColumns: [],
      message: reason instanceof Error ? reason.message : "Database diagnostics could not run.",
    }));
    setDatabaseDiagnostics(diagnostics);

    if (jobs[0].status === "fulfilled") setOverview(jobs[0].value);
    if (jobs[1].status === "fulfilled") setProducts(jobs[1].value.products || []);
    if (jobs[2].status === "fulfilled") setOrders(jobs[2].value.orders || []);
    if (jobs[3].status === "fulfilled") setCustomers(jobs[3].value.customers || []);
    if (jobs[4].status === "fulfilled") setCategories(jobs[4].value.categories || []);
    if (jobs[5].status === "fulfilled") setCoupons(jobs[5].value.coupons || []);
    if (jobs[6].status === "fulfilled") setReviews(jobs[6].value.reviews || []);
    if (jobs[7].status === "fulfilled") setMessages(jobs[7].value.messages || []);
    if (jobs[8].status === "fulfilled") setBanners(jobs[8].value.banners || []);
    if (jobs[9].status === "fulfilled") {
      const value = jobs[9].value.settings;
      setSettings({ storeName: value.storeName, supportEmail: value.supportEmail, supportPhone: value.supportPhone, address: value.address, announcement: value.announcement, shippingFee: String(value.shippingFee), freeShippingThreshold: String(value.freeShippingThreshold), instagramUrl: value.instagramUrl || "", facebookUrl: value.facebookUrl || "", youtubeUrl: value.youtubeUrl || "" });
    }

    if (failed.length) setError(`${failed.length} of 10 admin sections failed. Open the diagnostic details below to see the exact API error for each section.`);
    else if (diagnostics.adminAuthorized && (!diagnostics.databaseConnected || !diagnostics.schemaReady)) setError("The database or schema needs attention. See database diagnostics below.");
    setLoading(false);
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matches = `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(search.toLowerCase());
    const statusMatch = productFilter === "all" || (productFilter === "active" ? product.active : productFilter === "hidden" ? !product.active : product.stock <= 5);
    return matches && statusMatch;
  }), [products, search, productFilter]);
  const lowStockProducts = useMemo(() => products.filter((product) => product.active && product.stock <= 5).sort((a, b) => a.stock - b.stock), [products]);
  const stats = overview?.stats || {};

  function selectTab(next: Tab) { setTab(next); setMobileNav(false); setMessage(""); setError(""); }
  function startEdit(product: AdminProduct) {
    setEditingProduct(product.id);
    setProductForm({ name: product.name, brand: product.brand || "", category: product.category, description: product.description || "", price: String(product.price), mrp: String(product.mrp), image: product.image, images: parseGallery(product.images).join("\n"), stock: String(product.stock), featured: product.featured, active: product.active, source: product.source || "OWN", externalUrl: product.externalUrl || "" });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function newProduct() { setEditingProduct(null); setProductForm({ ...blankProduct, category: categories.find((item) => item.active)?.name || defaultCategories[0].name }); setShowProductForm(true); }
  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const payload = { ...productForm, price: Number(productForm.price), mrp: Number(productForm.mrp), stock: Number(productForm.stock), images: productForm.images.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) };
    try {
      await api(editingProduct ? `/api/products/${editingProduct}` : "/api/products", { method: editingProduct ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setMessage(editingProduct ? "Product updated. Storefront will show the changes." : "Product added. It is now active and will appear on the homepage." );
      setShowProductForm(false); setEditingProduct(null); setProductForm(blankProduct); await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Product could not be saved."); }
    finally { setSaving(false); }
  }
  async function toggleProduct(product: AdminProduct) {
    try { await api(`/api/products/${product.id}`, { method: "PATCH", body: JSON.stringify({ active: !product.active }) }); await loadAll(); setMessage(`${product.name} ${product.active ? "hidden" : "published"}.`); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update product."); }
  }
  async function saveStock(id: string) {
    const stock = Number(stockDrafts[id]);
    if (!Number.isInteger(stock) || stock < 0) { setError("Stock must be a whole number zero or greater."); return; }
    try { await api(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify({ stock }) }); setStockDrafts((old) => ({ ...old, [id]: "" })); await loadAll(); setMessage("Inventory quantity updated."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update stock."); }
  }
  async function updateOrder(id: string, status: string) {
    try { await api(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await loadAll(); setMessage("Order status updated."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update order."); }
  }
  async function addCategory(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...categoryForm, sortOrder: Number(categoryForm.sortOrder) };
      await api(editingCategory ? `/api/admin/categories/${editingCategory}` : "/api/admin/categories", { method: editingCategory ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setCategoryForm(blankCategory); setEditingCategory(null); await loadAll(); setMessage(editingCategory ? "Category updated." : "Category created.");
    }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save category."); }
    finally { setSaving(false); }
  }
  function startEditCategory(category: Category) {
    setEditingCategory(category.id);
    setCategoryForm({ name: category.name, description: category.description || "", image: category.image, sortOrder: String(category.sortOrder) });
    setTab("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function toggleCategory(category: Category) {
    try { await api(`/api/admin/categories/${category.id}`, { method: "PATCH", body: JSON.stringify({ active: !category.active }) }); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update category."); }
  }
  async function addCoupon(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try { await api("/api/admin/coupons", { method: "POST", body: JSON.stringify({ ...couponForm, value: Number(couponForm.value), minOrder: Number(couponForm.minOrder), maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null, usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null }) }); setCouponForm(blankCoupon); await loadAll(); setMessage("Coupon created."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create coupon."); }
    finally { setSaving(false); }
  }
  async function toggleCoupon(coupon: Coupon) {
    try { await api(`/api/admin/coupons/${coupon.id}`, { method: "PATCH", body: JSON.stringify({ active: !coupon.active }) }); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update coupon."); }
  }
  async function addBanner(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try { await api("/api/admin/banners", { method: "POST", body: JSON.stringify({ ...bannerForm, sortOrder: Number(bannerForm.sortOrder) }) }); setBannerForm(blankBanner); await loadAll(); setMessage("Banner created. Active HOME banners display on the homepage."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create banner."); }
    finally { setSaving(false); }
  }
  async function toggleBanner(banner: Banner) {
    try { await api(`/api/admin/banners/${banner.id}`, { method: "PATCH", body: JSON.stringify({ active: !banner.active }) }); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update banner."); }
  }
  async function updateMessageStatus(id: string, status: string) {
    try { await api("/api/admin/messages", { method: "PATCH", body: JSON.stringify({ id, status }) }); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update message."); }
  }
  async function toggleReview(review: Review, approved: boolean) {
    try { await api(`/api/admin/reviews/${review.id}`, { method: "PATCH", body: JSON.stringify({ approved }) }); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not moderate review."); }
  }
  async function deleteReview(review: Review) {
    if (!window.confirm("Permanently delete this review?")) return;
    try { await api(`/api/admin/reviews/${review.id}`, { method: "DELETE" }); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete review."); }
  }
  async function saveSettings(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try { await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ ...settings, shippingFee: Number(settings.shippingFee), freeShippingThreshold: Number(settings.freeShippingThreshold) }) }); setMessage("Store settings saved."); await loadAll(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save settings."); }
    finally { setSaving(false); }
  }

  const activeTabLabel = navGroups.flatMap((group) => group.items).find((item) => item.id === tab)?.label || "Overview";

  return <div className="sa-admin-shell">
    <aside className={`sa-sidebar ${mobileNav ? "is-open" : ""}`}>
      <div className="sa-sidebar-brand"><span className="sa-brand-mark"><Store size={22}/></span><span><b>Saanwariya</b><small>STORE ADMIN</small></span><button className="sa-mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="sa-store-switch"><span className="sa-store-avatar">SS</span><span><b>Saanwariya Seth Fashion</b><small>Online store · India</small></span><ChevronDown size={15}/></div>
      <nav className="sa-admin-nav" aria-label="Admin navigation">{navGroups.map((group) => <div className="sa-nav-group" key={group.label}><small className="sa-nav-heading">{group.label}</small>{group.items.map((item) => { const Icon = item.icon; const count = item.id === "orders" ? Number(stats.pendingOrders || 0) : item.id === "reviews" ? Number(stats.pendingReviews || 0) : item.id === "messages" ? Number(stats.newMessages || 0) : 0; return <button key={item.id} className={`sa-nav-item ${tab === item.id ? "active" : ""}`} onClick={() => selectTab(item.id)}><Icon size={17}/><span>{item.label}</span>{count > 0 && <i>{count}</i>}</button>; })}</div>)}</nav>
      <div className="sa-sidebar-bottom"><div className="sa-sidebar-help"><ShieldCheck size={17}/><div><b>Store protected</b><small>Admin session active</small></div></div><a href="/" target="_blank" rel="noreferrer" className="sa-view-store"><Store size={16}/> View live storefront <ArrowUpRight size={14}/></a></div>
    </aside>
    {mobileNav && <button className="sa-sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="sa-admin-main">
      <header className="sa-topbar"><div className="sa-topbar-left"><button className="sa-menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><div><small>SAANWARIYA / ADMIN</small><b>{activeTabLabel}</b></div></div><div className="sa-topbar-actions"><span className="sa-live-pill"><i/> Store is live</span><button className="sa-refresh" onClick={() => void loadAll()} title="Refresh dashboard"><RefreshCw size={16}/></button><span className="sa-admin-avatar">{adminName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span></div></header>
      <div className="sa-content">
        <div className="sa-page-heading"><div><span className="sa-kicker">STORE MANAGEMENT</span><h1>{tab === "overview" ? <>Good day, {adminName.split(" ")[0]}</> : activeTabLabel}<em>{tab === "overview" ? " ✦" : ""}</em></h1><p>{tab === "overview" ? "Here is what is happening with your store today." : `Manage your ${activeTabLabel.toLowerCase()} and keep your storefront running smoothly.`}</p></div>{tab === "products" && <button className="sa-primary-btn" onClick={newProduct}><Plus size={17}/> Add product</button>}{tab === "categories" && <span className="sa-date-chip"><Tags size={15}/> Store taxonomy</span>}</div>
        {message && <div className="sa-alert success"><CheckCircle2 size={17}/>{message}<button onClick={() => setMessage("")}><X size={15}/></button></div>}
        {error && <div className="sa-alert error"><AlertTriangle size={17}/>{error}<button onClick={() => setError("")}><X size={15}/></button></div>}
        {(failedSections.length > 0 || (databaseDiagnostics && (!databaseDiagnostics.databaseConnected || !databaseDiagnostics.schemaReady))) && <section className="sa-diagnostics-panel" aria-live="polite">
          <div className="sa-diagnostics-head"><div><span className="sa-kicker">SYSTEM HEALTH</span><h2>Admin connection diagnostics</h2><p>These details identify whether the issue is login permission, database connectivity or an outdated schema.</p></div><button className="sa-outline-btn" type="button" onClick={() => void loadAll()}><RefreshCw size={15}/> Retry checks</button></div>
          <div className="sa-diagnostics-status-grid">
            <div className={databaseDiagnostics?.databaseConnected === true ? "is-ok" : databaseDiagnostics?.databaseConnected === false ? "is-bad" : "is-neutral"}><span>MySQL connection</span><b>{databaseDiagnostics?.databaseConnected === true ? "Connected" : databaseDiagnostics?.databaseConnected === false ? "Connection failed" : "Not checked"}</b></div>
            <div className={databaseDiagnostics?.schemaReady === true ? "is-ok" : databaseDiagnostics?.schemaReady === false ? "is-bad" : "is-neutral"}><span>Prisma schema</span><b>{databaseDiagnostics?.schemaReady === true ? "Up to date" : databaseDiagnostics?.schemaReady === false ? "Needs attention" : "Not checked"}</b></div>
            <div className={databaseDiagnostics?.adminAuthorized === true && !failedSections.some((item) => item.message.includes("HTTP 401") || item.message.includes("HTTP 403")) ? "is-ok" : "is-bad"}><span>Admin API access</span><b>{databaseDiagnostics?.adminAuthorized === false || failedSections.some((item) => item.message.includes("HTTP 401") || item.message.includes("HTTP 403")) ? "Permission denied" : failedSections.length ? "Some requests failed" : "Available"}</b></div>
          </div>
          {databaseDiagnostics?.message && <p className="sa-diagnostics-note">{databaseDiagnostics.message}</p>}
          {(databaseDiagnostics?.missingTables?.length || databaseDiagnostics?.missingColumns?.length) ? <div className="sa-diagnostics-missing"><b>Missing database schema items</b>{databaseDiagnostics.missingTables.length > 0 && <p>Tables: {databaseDiagnostics.missingTables.join(", ")}</p>}{databaseDiagnostics.missingColumns.length > 0 && <p>Columns: {databaseDiagnostics.missingColumns.join(", ")}</p>}<code>npx prisma db push</code><small>Run this from your project folder using the same production DATABASE_URL after taking a database backup. Do not use --accept-data-loss.</small></div> : null}
          {failedSections.length > 0 && <div className="sa-diagnostics-list">{failedSections.map((item) => <article key={item.endpoint}><span className="sa-diagnostics-dot"/><div><b>{item.label}</b><small>{item.endpoint}</small><p>{item.message}</p></div></article>)}</div>}
          {(databaseDiagnostics?.adminAuthorized === false || failedSections.some((item) => item.message.includes("HTTP 401") || item.message.includes("HTTP 403"))) && <div className="sa-diagnostics-help">Admin permission was rejected. Sign out and sign in again. If it continues, verify that this account has the ADMIN role and that AUTH_SECRET is identical across the production app instances.</div>}
          {databaseDiagnostics?.adminAuthorized === true && databaseDiagnostics.databaseConnected === false && <div className="sa-diagnostics-help">MySQL connection failed. Check Hostinger production DATABASE_URL, database user privileges and whether the app is using the Hostinger-local database host.</div>}
        </section>}
        {loading ? <div className="sa-loading"><span className="sa-spinner"/>Loading store workspace…</div> : <>
          {tab === "overview" && <section className="sa-overview-view">
            <div className="sa-stat-grid">
              <StatCard label="Gross order value" value={money(Number(stats.revenue || 0))} helper={`${stats.orders || 0} total orders`} icon={CircleDollarSign} tone="green"/>
              <StatCard label="Orders" value={String(stats.orders || 0)} helper={`${stats.pendingOrders || 0} need attention`} icon={ShoppingCart} tone="orange"/>
              <StatCard label="Active products" value={String(stats.activeProducts || 0)} helper={`${stats.products || 0} total catalogue items`} icon={ShoppingBag} tone="blue"/>
              <StatCard label="Customers" value={String(stats.users || 0)} helper="Registered shoppers" icon={Users} tone="amber"/>
            </div>
            <div className="sa-overview-grid"><section className="sa-panel sa-panel-large"><div className="sa-panel-heading"><div><span className="sa-kicker">LATEST ACTIVITY</span><h2>Recent orders</h2></div><button className="sa-text-btn" onClick={() => selectTab("orders")}>View all <ChevronRight size={15}/></button></div>{orders.slice(0, 6).length ? <div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.slice(0, 6).map((order) => <tr key={order.id}><td><b>#{order.orderNumber}</b></td><td>{order.fullName}</td><td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td><td><strong>{money(order.total)}</strong></td><td><span className={`sa-status status-${order.status.toLowerCase()}`}>{order.status}</span></td></tr>)}</tbody></table></div> : <EmptyState title="No orders yet" text="New customer orders will appear here."/>}</section>
              <section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">NEEDS ATTENTION</span><h2>Store alerts</h2></div><Bell size={18}/></div><div className="sa-alert-list"><button onClick={() => selectTab("inventory")}><span className="sa-alert-icon orange"><AlertTriangle size={17}/></span><span><b>{stats.lowStock || 0} low-stock products</b><small>Review inventory levels</small></span><ChevronRight size={16}/></button><button onClick={() => selectTab("orders")}><span className="sa-alert-icon green"><Truck size={17}/></span><span><b>{stats.pendingOrders || 0} orders to process</b><small>Confirm or ship orders</small></span><ChevronRight size={16}/></button><button onClick={() => selectTab("reviews")}><span className="sa-alert-icon amber"><Star size={17}/></span><span><b>{stats.pendingReviews || 0} reviews pending</b><small>Moderate customer feedback</small></span><ChevronRight size={16}/></button><button onClick={() => selectTab("messages")}><span className="sa-alert-icon blue"><Mail size={17}/></span><span><b>{stats.newMessages || 0} new messages</b><small>Respond to customers</small></span><ChevronRight size={16}/></button></div></section></div>
            <div className="sa-overview-grid"><section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">CATALOGUE</span><h2>Recently added</h2></div><button className="sa-text-btn" onClick={() => selectTab("products")}>Manage products <ChevronRight size={15}/></button></div><div className="sa-mini-products">{products.slice(0, 5).map((product) => <div key={product.id}><img src={product.image} alt=""/><span><b>{product.name}</b><small>{product.category}</small></span><strong>{money(product.price)}</strong></div>)}</div></section><section className="sa-panel sa-quick-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">QUICK ACTIONS</span><h2>Run your store</h2></div><Sparkles size={18}/></div><div className="sa-quick-grid"><button onClick={newProduct}><Plus/><span>Add a product</span></button><button onClick={() => selectTab("coupons")}><BadgePercent/><span>Create a coupon</span></button><button onClick={() => selectTab("banners")}><ImageIcon/><span>Update homepage banner</span></button><button onClick={() => selectTab("settings")}><Settings/><span>Store settings</span></button></div></section></div>
          </section>}

          {tab === "products" && <section className="sa-products-view">
            {showProductForm && <form className="sa-panel sa-product-editor" onSubmit={saveProduct}><div className="sa-panel-heading"><div><span className="sa-kicker">CATALOGUE EDITOR</span><h2>{editingProduct ? "Edit product" : "Add a new product"}</h2><p>Active products are published in the shop and homepage automatically.</p></div><button type="button" className="sa-close-btn" onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm(blankProduct); }}><X size={18}/></button></div><div className="sa-form-grid"><label>Product name *<input required minLength={2} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Royal Zari Silk Saree"/></label><label>Brand<input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}/></label><label>Category *<select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>{[...new Set([...categories.filter((item) => item.active).map((item) => item.name), ...defaultCategories.map((item) => item.name)])].map((name) => <option key={name}>{name}</option>)}</select></label><label>Source<select value={productForm.source} onChange={(e) => setProductForm({ ...productForm, source: e.target.value as "OWN" | "FLIPKART" })}><option value="OWN">Own inventory</option><option value="FLIPKART">Flipkart affiliate</option></select></label><label>Selling price (₹) *<input required type="number" min="1" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}/></label><label>MRP (₹) *<input required type="number" min="1" step="0.01" value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}/></label><label>Available stock *<input required type="number" min="0" step="1" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}/></label><label>Main image URL *<input required type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://… or /images/product.webp"/></label><label className="sa-field-wide">Gallery image URLs <textarea rows={3} value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} placeholder="One image URL per line (up to 12)"/><small>Add one image URL per line to create the product gallery.</small></label><label className="sa-field-wide">Product description<textarea rows={4} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Describe fabric, fit, finish, care and product details…"/></label>{productForm.source === "FLIPKART" && <label className="sa-field-wide">Affiliate product URL<input type="url" value={productForm.externalUrl} onChange={(e) => setProductForm({ ...productForm, externalUrl: e.target.value })} placeholder="https://www.flipkart.com/…"/></label>}</div><div className="sa-form-options"><label className="sa-check"><input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}/> Feature on homepage</label><label className="sa-check"><input type="checkbox" checked={productForm.active} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}/> Publish product immediately</label></div><div className="sa-form-footer"><span>Fields marked * are required. MRP must be equal to or higher than selling price.</span><button className="sa-primary-btn" disabled={saving}>{saving ? "Saving…" : <><Check size={16}/> {editingProduct ? "Save changes" : "Publish product"}</>}</button></div></form>}
            <div className="sa-panel"><div className="sa-panel-heading sa-products-toolbar"><div><span className="sa-kicker">YOUR CATALOGUE</span><h2>All products <small>{products.length}</small></h2></div><div className="sa-toolbar-actions"><div className="sa-search-box"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"/></div><select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}><option value="all">All products</option><option value="active">Published</option><option value="hidden">Hidden</option><option value="low">Low stock</option></select><button className="sa-outline-btn" onClick={newProduct}><Plus size={16}/> Add product</button></div></div><div className="sa-table-wrap"><table className="sa-table sa-product-table"><thead><tr><th>Product</th><th>Category</th><th>Price / MRP</th><th>Stock</th><th>Homepage</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><div className="sa-product-cell"><img src={product.image} alt=""/><span><b>{product.name}</b><small>{product.brand}</small></span></div></td><td>{product.category}</td><td><b>{money(product.price)}</b><small className="sa-muted-line">MRP {money(product.mrp)}</small></td><td><span className={`sa-stock-pill ${product.stock <= 5 ? "low" : ""}`}>{product.stock} units</span></td><td>{product.featured ? <span className="sa-featured-pill">Featured</span> : <span className="sa-muted-pill">Standard</span>}</td><td><span className={`sa-status ${product.active ? "status-delivered" : "status-cancelled"}`}>{product.active ? "Published" : "Hidden"}</span></td><td><div className="sa-row-actions"><button title="Edit product" onClick={() => startEdit(product)}><Pencil size={15}/></button><button title={product.active ? "Hide product" : "Publish product"} onClick={() => void toggleProduct(product)}>{product.active ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div></td></tr>)}</tbody></table>{!filteredProducts.length && <EmptyState title="No products found" text="Try another search or add a new product."/>}</div></div>
          </section>}

          {tab === "inventory" && <section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">STOCK CONTROL</span><h2>Inventory health</h2><p>Update quantities without opening each product.</p></div><span className="sa-count-badge">{lowStockProducts.length} low stock</span></div><div className="sa-inventory-grid">{products.filter((p) => p.active).sort((a, b) => a.stock - b.stock).map((product) => <article className="sa-inventory-card" key={product.id}><img src={product.image} alt=""/><div className="sa-inventory-info"><b>{product.name}</b><small>{product.category} · {money(product.price)}</small><span className={`sa-stock-pill ${product.stock <= 5 ? "low" : ""}`}>{product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}</span></div><div className="sa-stock-edit"><input type="number" min="0" value={stockDrafts[product.id] ?? String(product.stock)} onChange={(e) => setStockDrafts((old) => ({ ...old, [product.id]: e.target.value }))}/><button onClick={() => void saveStock(product.id)}>Save</button></div></article>)}</div>{!products.length && <EmptyState title="No inventory yet" text="Add products to start tracking stock."/>}</section>}

          {tab === "orders" && <section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">FULFILMENT</span><h2>Customer orders <small>{orders.length}</small></h2><p>Review order details and move each order through fulfilment.</p></div><button className="sa-outline-btn" onClick={() => void loadAll()}><RefreshCw size={15}/> Refresh</button></div><div className="sa-orders-list">{orders.map((order) => <article className="sa-order-card" key={order.id}><button className="sa-order-summary" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}><span className="sa-order-icon"><ShoppingBag size={18}/></span><span className="sa-order-id"><b>#{order.orderNumber}</b><small>{order.fullName} · {new Date(order.createdAt).toLocaleString("en-IN")}</small></span><span className="sa-order-items">{order.items.length} line items</span><strong>{money(order.total)}</strong><span className={`sa-status status-${order.status.toLowerCase()}`}>{order.status}</span><ChevronDown size={17}/></button>{expandedOrder === order.id && <div className="sa-order-expanded"><div className="sa-order-customer"><b>Delivery details</b><span>{order.fullName}</span><span>{order.email}</span><span>{order.phone}</span><span>{order.address}, {order.city}, {order.state} — {order.postalCode}</span><span>Payment: {order.paymentMethod || "COD"}</span>{order.couponCode && <span>Coupon: {order.couponCode} · Discount {money(order.discount || 0)}</span>}</div><div className="sa-order-line-items">{order.items.map((item, index) => <span key={`${order.id}-${index}`}>{item.productName} × {item.quantity} <b>{money(item.price * item.quantity)}</b></span>)}</div><label className="sa-order-status-control">Update status<select value={order.status} onChange={(e) => void updateOrder(order.id, e.target.value)}><option value="PLACED">Placed</option><option value="CONFIRMED">Confirmed</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select></label></div>}</article>)}{!orders.length && <EmptyState title="No orders yet" text="Customer orders will appear here as soon as checkout is completed."/>}</div></section>}

          {tab === "customers" && <section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">CUSTOMER RELATIONSHIPS</span><h2>Customers <small>{customers.length}</small></h2><p>Registered shoppers and their store activity.</p></div><Users size={19}/></div><div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Customer</th><th>Joined</th><th>Orders</th><th>Reviews</th><th>Lifetime order value*</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><div className="sa-customer-cell"><span>{customer.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><b>{customer.name}</b><small>{customer.email}</small></div></div></td><td>{new Date(customer.createdAt).toLocaleDateString("en-IN")}</td><td>{customer._count.orders}</td><td>{customer._count.reviews}</td><td><b>{money(customer.totalSpent)}</b></td></tr>)}</tbody></table>{!customers.length && <EmptyState title="No registered customers" text="Customer profiles will appear after registration."/>}</div><p className="sa-footnote">*Order value is calculated from the most recent 100 orders returned for each customer.</p></section>}

          {tab === "categories" && <section className="sa-categories-layout"><form className="sa-panel sa-compact-form" onSubmit={addCategory}><div className="sa-panel-heading"><div><span className="sa-kicker">MERCHANDISING</span><h2>{editingCategory ? "Edit category" : "Create category"}</h2></div><Plus size={18}/></div><label>Category name *<input required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Festive Wear"/></label><label>Category image URL *<input required type="text" value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} placeholder="https://…"/></label><label>Description<textarea rows={3} value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}/></label><label>Display order<input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: e.target.value })}/></label><div className="sa-category-form-actions">{editingCategory && <button type="button" className="sa-outline-btn" onClick={() => { setEditingCategory(null); setCategoryForm(blankCategory); }}>Cancel</button>}<button className="sa-primary-btn" disabled={saving}>{editingCategory ? <><Check size={16}/> Save category</> : <><Plus size={16}/> Add category</>}</button></div></form><section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">STORE TAXONOMY</span><h2>Categories <small>{categories.length}</small></h2></div></div><div className="sa-category-list">{categories.map((category) => <article key={category.id}><img src={category.image} alt=""/><span><b>{category.name}</b><small>{category.productCount} products · /shop?category={encodeURIComponent(category.name)}</small></span><span className={`sa-status ${category.active ? "status-delivered" : "status-cancelled"}`}>{category.active ? "Active" : "Hidden"}</span><div className="sa-row-actions"><button title="Edit category" onClick={() => startEditCategory(category)}><Pencil size={15}/></button><button title={category.active ? "Hide category" : "Show category"} onClick={() => void toggleCategory(category)}>{category.active ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div></article>)}{!categories.length && <EmptyState title="No categories found" text="Run the category seed command or add your first category."/>}</div></section></section>}

          {tab === "coupons" && <section className="sa-categories-layout"><form className="sa-panel sa-compact-form" onSubmit={addCoupon}><div className="sa-panel-heading"><div><span className="sa-kicker">PROMOTIONS</span><h2>Create coupon</h2></div><BadgePercent size={18}/></div><label>Coupon code *<input required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="WELCOME10"/></label><label>Description<input value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="First order offer"/></label><div className="sa-form-grid"><label>Discount type<select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}><option value="PERCENT">Percentage</option><option value="FIXED">Fixed amount</option></select></label><label>Discount value *<input required type="number" min="1" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}/></label><label>Minimum order (₹)<input type="number" min="0" value={couponForm.minOrder} onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}/></label><label>Max discount (₹)<input type="number" min="0" value={couponForm.maxDiscount} onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}/></label><label className="sa-field-wide">Usage limit<input type="number" min="1" value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })} placeholder="Leave blank for unlimited"/></label></div><button className="sa-primary-btn" disabled={saving}><Plus size={16}/> Create coupon</button></form><section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">ACTIVE OFFERS</span><h2>Coupons <small>{coupons.length}</small></h2></div></div><div className="sa-coupon-list">{coupons.map((coupon) => <article key={coupon.id}><span className="sa-coupon-tag"><BadgePercent size={18}/></span><div><b>{coupon.code}</b><small>{coupon.discountType === "PERCENT" ? `${coupon.value}% off` : `${money(coupon.value)} off`} · Min. order {money(coupon.minOrder)}</small><small>{coupon.usedCount} uses{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</small></div><span className={`sa-status ${coupon.active ? "status-delivered" : "status-cancelled"}`}>{coupon.active ? "Active" : "Paused"}</span><button className="sa-icon-action" onClick={() => void toggleCoupon(coupon)}>{coupon.active ? <EyeOff size={16}/> : <Eye size={16}/>}</button></article>)}{!coupons.length && <EmptyState title="No coupons created" text="Create a discount code to run your first promotion."/>}</div></section></section>}

          {tab === "reviews" && <section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">CUSTOMER VOICE</span><h2>Product reviews <small>{reviews.length}</small></h2><p>Approve genuine customer feedback before it appears publicly.</p></div><Star size={19}/></div><div className="sa-review-list">{reviews.map((review) => <article key={review.id}><div className="sa-review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><b>{review.title}</b><p>{review.comment}</p><small>{review.user.name} · {review.product.name} · {new Date(review.createdAt).toLocaleDateString("en-IN")}</small><div className="sa-review-actions"><span className={`sa-status ${review.approved ? "status-delivered" : "status-placed"}`}>{review.approved ? "Published" : "Pending review"}</span>{!review.approved && <button className="sa-small-btn green" onClick={() => void toggleReview(review, true)}><Check size={14}/> Approve</button>}{review.approved && <button className="sa-small-btn" onClick={() => void toggleReview(review, false)}><EyeOff size={14}/> Unpublish</button>}<button className="sa-small-btn danger" onClick={() => void deleteReview(review)}><Trash2 size={14}/> Delete</button></div></article>)}{!reviews.length && <EmptyState title="No reviews yet" text="Submitted customer reviews will appear here."/>}</div></section>}

          {tab === "messages" && <section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">CUSTOMER SUPPORT</span><h2>Contact messages <small>{messages.length}</small></h2><p>Track and resolve messages sent through your Contact page.</p></div><MessageSquare size={19}/></div><div className="sa-message-list">{messages.map((item) => <article key={item.id}><div className="sa-message-head"><span className={`sa-status ${item.status === "RESOLVED" ? "status-delivered" : item.status === "READ" ? "status-confirmed" : "status-placed"}`}>{item.status}</span><small>{new Date(item.createdAt).toLocaleString("en-IN")}</small></div><b>{item.subject}</b><span>{item.name} · <a href={`mailto:${item.email}`}>{item.email}</a></span><p>{item.message}</p><div className="sa-message-actions"><a className="sa-small-btn" href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}><Mail size={14}/> Reply by email</a><button className="sa-small-btn" onClick={() => void updateMessageStatus(item.id, "READ")}>Mark read</button><button className="sa-small-btn green" onClick={() => void updateMessageStatus(item.id, "RESOLVED")}>Resolve</button></div></article>)}{!messages.length && <EmptyState title="Inbox is clear" text="New contact form submissions will arrive here."/>}</div></section>}

          {tab === "banners" && <section className="sa-categories-layout"><form className="sa-panel sa-compact-form" onSubmit={addBanner}><div className="sa-panel-heading"><div><span className="sa-kicker">STOREFRONT CONTENT</span><h2>Add homepage banner</h2></div><ImageIcon size={18}/></div><label>Banner title *<input required value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}/></label><label>Subtitle<input value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}/></label><label>Image URL *<input required type="url" value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}/></label><label>Destination URL<input value={bannerForm.href} onChange={(e) => setBannerForm({ ...bannerForm, href: e.target.value })}/></label><div className="sa-form-grid"><label>Position<select value={bannerForm.position} onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}><option value="HOME">Homepage</option><option value="SHOP">Shop page</option></select></label><label>Display order<input type="number" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })}/></label></div><button className="sa-primary-btn" disabled={saving}><Plus size={16}/> Create banner</button></form><section className="sa-panel"><div className="sa-panel-heading"><div><span className="sa-kicker">LIVE CONTENT</span><h2>Store banners <small>{banners.length}</small></h2></div></div><div className="sa-banner-list">{banners.map((banner) => <article key={banner.id}><img src={banner.image} alt=""/><span><b>{banner.title}</b><small>{banner.position} · Order {banner.sortOrder}</small></span><span className={`sa-status ${banner.active ? "status-delivered" : "status-cancelled"}`}>{banner.active ? "Active" : "Hidden"}</span><button className="sa-icon-action" onClick={() => void toggleBanner(banner)}>{banner.active ? <EyeOff size={16}/> : <Eye size={16}/>}</button></article>)}{!banners.length && <EmptyState title="No banners yet" text="Create a banner to promote a campaign on your homepage."/>}</div></section></section>}

          {tab === "settings" && <form className="sa-panel sa-settings-form" onSubmit={saveSettings}><div className="sa-panel-heading"><div><span className="sa-kicker">STORE CONFIGURATION</span><h2>Store settings</h2><p>Keep store identity, support contacts and delivery values up to date.</p></div><Settings size={19}/></div><div className="sa-form-grid"><label>Store name<input required value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}/></label><label>Support email<input required type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}/></label><label>Support phone<input value={settings.supportPhone} onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}/></label><label>Shipping fee (₹)<input type="number" min="0" value={settings.shippingFee} onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}/></label><label>Free shipping from (₹)<input type="number" min="0" value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}/></label><label className="sa-field-wide">Store address<textarea rows={3} value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })}/></label><label className="sa-field-wide">Announcement bar text<textarea rows={2} value={settings.announcement} onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}/></label><label>Instagram URL<input type="url" value={settings.instagramUrl} onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}/></label><label>Facebook URL<input type="url" value={settings.facebookUrl} onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}/></label><label className="sa-field-wide">YouTube URL<input type="url" value={settings.youtubeUrl} onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}/></label></div><div className="sa-form-footer"><span>Delivery prices are saved to StoreSettings. They do not change existing orders.</span><button className="sa-primary-btn" disabled={saving}><Check size={16}/> {saving ? "Saving…" : "Save store settings"}</button></div></form>}
        </>}
        <footer className="sa-admin-footer"><span>SAANWARIYA SETH FASHION · STORE ADMIN</span><span>Made with <b>♥</b> by Mivaan Jangra</span></footer>
      </div>
    </main>
  </div>;
}
