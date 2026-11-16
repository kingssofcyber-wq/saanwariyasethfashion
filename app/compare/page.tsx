"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import { useStore } from "@/components/providers";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/lib/catalog";
export default function ComparePage() {
  const { compare, toggleCompare } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/products").then((response) => response.json()).then((data) => setProducts((data.products || []).filter((product: Product) => compare.includes(product.id)))).finally(() => setLoading(false));
  }, [compare]);
  return <div className="container page-wrap"><div className="breadcrumbs"><Link href="/">Home</Link> / <span>Compare products</span></div><span className="eyebrow">MAKE A CONFIDENT CHOICE</span><h1>Compare your <i>shortlist.</i></h1><p className="section-sub">Compare up to four products. Use the compare arrows on product cards to add or remove items.</p>{loading ? <p>Loading comparison…</p> : products.length ? <><div className="compare-toolbar"><span>{products.length} of 4 products selected</span><button onClick={() => products.forEach((product) => toggleCompare(product.id))}><Trash2 size={15}/> Clear comparison</button></div><ProductGrid products={products}/></> : <div className="empty-state"><ArrowLeftRight size={34}/><h3>Your comparison list is empty.</h3><p>Add products using the compare icon on any product card.</p><Link href="/shop" className="btn btn-dark">Browse products</Link></div>}</div>;
}
