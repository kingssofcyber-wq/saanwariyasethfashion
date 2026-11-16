import { prisma } from "@/lib/prisma"; import { demoProducts, categories, type Product } from "@/lib/catalog"; import { ProductGrid } from "@/components/product-grid"; import Link from "next/link"; import { SlidersHorizontal } from "lucide-react"; import { AdUnit } from "@/components/adsense"; import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shop All Collections", description: "Browse sarees, suits, jewellery, watches, bags, footwear and lifestyle products at Saanwariya Seth Fashion.", alternates: { canonical: "/shop" } };
export const dynamic="force-dynamic";
type Params={q?:string;category?:string;sort?:string;source?:string};
async function getItems(p:Params):Promise<Product[]>{
  const filters = (products: Product[]) => products.filter((item) =>
    (!p.category || item.category.toLowerCase() === p.category.toLowerCase()) &&
    (!p.q || `${item.name} ${item.brand} ${item.category} ${item.description}`.toLowerCase().includes(p.q.toLowerCase()))
  );
  try {
    const where = { active: true, ...(p.category ? { category: { equals: p.category } } : {}), ...(p.q ? { OR: [{ name: { contains: p.q } }, { brand: { contains: p.q } }, { description: { contains: p.q } }] } : {}) };
    const [items, totalProducts] = await Promise.all([
      prisma.product.findMany({ where, orderBy: p.sort === "price-low" ? { price: "asc" } : p.sort === "price-high" ? { price: "desc" } : { createdAt: "desc" } }),
      prisma.product.count(),
    ]);
    // Demo items are shown only when the database has not been seeded. Never mix demo items into a live catalogue.
    return totalProducts === 0 ? filters(demoProducts) : items as Product[];
  } catch {
    return filters(demoProducts);
  }
}
export default async function Shop({searchParams}:{searchParams:Promise<Params>}){const p=await searchParams;const items=await getItems(p);return <div className="page-wrap container"><div className="breadcrumbs"><Link href="/">Home</Link> / <span>Shop</span></div><div className="shop-hero"><div><span className="eyebrow">THE COMPLETE STYLE DESTINATION</span><h1>Shop all <i>collections.</i></h1><p>Everyday essentials, thoughtful gifts and statement pieces — all in one place.</p></div><div className="shop-count"><strong>{items.length.toString().padStart(2,"0")}</strong><span>curated finds</span></div></div><AdUnit slotKey="shopTop" className="shop-ad-slot"/><div className="shop-layout"><aside className="filter-sidebar"><h3><SlidersHorizontal size={17}/> Explore</h3><Link className={!p.category?"filter-active":""} href="/shop">All products</Link>{categories.map(c=><Link className={p.category===c.name?"filter-active":""} href={`/shop?category=${encodeURIComponent(c.name)}`} key={c.slug}>{c.name}</Link>)}<div className="filter-sep"/><span className="filter-label">Marketplace</span><Link href="/shop/marketplace">Flipkart picks ↗</Link></aside><div className="shop-results"><div className="results-toolbar"><div><b>{p.q?`Results for “${p.q}”`:p.category||"All products"}</b><span>{items.length} items</span></div><form action="/shop" method="get" className="sort-form">{p.category&&<input type="hidden" name="category" value={p.category}/>}{p.q&&<input type="hidden" name="q" value={p.q}/>}<label htmlFor="sort">Sort by</label><select name="sort" id="sort" defaultValue={p.sort||"recommended"}><option value="recommended">Recommended</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select><button type="submit" className="sort-submit">Apply</button></form></div><ProductGrid products={items} inlineAd/><div className="flipkart-callout"><span>✦</span><p>Looking for more brands and everyday tech? Explore our Flipkart marketplace picks.</p><Link href="/shop/marketplace">Browse picks ↗</Link></div></div></div></div>}
