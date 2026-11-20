import { prisma } from "@/lib/prisma";
import { demoProducts, categories as fallbackCategories, type Product } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";
import { AdminManagedBanners } from "@/components/home-sections";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { AdUnit } from "@/components/adsense";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Collections",
  description: "Browse sarees, suits, jewellery, watches, bags, footwear and lifestyle products at Saanwariya Seth Fashion.",
  alternates: { canonical: "/shop" },
};
export const dynamic = "force-dynamic";

type Params = { q?: string; category?: string; sort?: string; source?: string };

async function getItems(params: Params): Promise<Product[]> {
  const filterDemo = (items: Product[]) => items.filter((item) =>
    (!params.category || item.category.toLowerCase() === params.category.toLowerCase()) &&
    (!params.q || `${item.name} ${item.brand} ${item.category} ${item.description}`.toLowerCase().includes(params.q.toLowerCase())),
  );
  try {
    const where = {
      active: true,
      ...(params.category ? { category: { equals: params.category } } : {}),
      ...(params.q ? { OR: [{ name: { contains: params.q } }, { brand: { contains: params.q } }, { description: { contains: params.q } }] } : {}),
    };
    const [items, totalProducts] = await Promise.all([
      prisma.product.findMany({ where, orderBy: params.sort === "price-low" ? { price: "asc" } : params.sort === "price-high" ? { price: "desc" } : { createdAt: "desc" } }),
      prisma.product.count(),
    ]);
    return totalProducts === 0 ? filterDemo(demoProducts) : items as Product[];
  } catch {
    return filterDemo(demoProducts);
  }
}

async function getShopContent() {
  try {
    const [dbCategories, banners] = await Promise.all([
      prisma.storeCategory.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.storeBanner.findMany({ where: { active: true, position: "SHOP" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 2 }),
    ]);
    const shopCategories = dbCategories.length ? dbCategories : fallbackCategories;
    return { shopCategories, banners };
  } catch {
    return { shopCategories: fallbackCategories, banners: [] };
  }
}

export default async function Shop({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const [items, content] = await Promise.all([getItems(params), getShopContent()]);
  return <div className="page-wrap container">
    <div className="breadcrumbs"><Link href="/">Home</Link> / <span>Shop</span></div>
    <div className="shop-hero"><div><span className="eyebrow">THE COMPLETE STYLE DESTINATION</span><h1>Shop all <i>collections.</i></h1><p>Everyday essentials, thoughtful gifts and statement pieces — all in one place.</p></div><div className="shop-count"><strong>{items.length.toString().padStart(2, "0")}</strong><span>curated finds</span></div></div>
    <AdminManagedBanners banners={content.banners}/>
    <AdUnit slotKey="shopTop" className="shop-ad-slot"/>
    <div className="shop-layout">
      <aside className="filter-sidebar"><h3><SlidersHorizontal size={17}/> Explore</h3><Link className={!params.category ? "filter-active" : ""} href="/shop">All products</Link>{content.shopCategories.map((category) => <Link className={params.category === category.name ? "filter-active" : ""} href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.slug}>{category.name}</Link>)}<div className="filter-sep"/><span className="filter-label">Marketplace</span><Link href="/shop/marketplace">Flipkart picks ↗</Link></aside>
      <div className="shop-results"><div className="results-toolbar"><div><b>{params.q ? `Results for “${params.q}”` : params.category || "All products"}</b><span>{items.length} items</span></div><form action="/shop" method="get" className="sort-form">{params.category && <input type="hidden" name="category" value={params.category} />}{params.q && <input type="hidden" name="q" value={params.q}/>}<label htmlFor="sort">Sort by</label><select name="sort" id="sort" defaultValue={params.sort || "recommended"}><option value="recommended">Recommended</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select><button type="submit" className="sort-submit">Apply</button></form></div><ProductGrid products={items} inlineAd/><div className="flipkart-callout"><span>✦</span><p>Looking for more brands and everyday tech? Explore our Flipkart marketplace picks.</p><Link href="/shop/marketplace">Browse picks ↗</Link></div></div>
    </div>
  </div>;
}
