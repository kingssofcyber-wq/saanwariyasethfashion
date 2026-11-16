import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { demoProducts, type Product, resolveProductImage } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
import { AdUnit } from "@/components/adsense";

type PageProps = { params: Promise<{ slug: string }> };
async function findProduct(slug: string): Promise<Product | null> {
  try {
    const [databaseProduct, totalProducts] = await Promise.all([
      prisma.product.findFirst({ where: { slug, active: true } }),
      prisma.product.count(),
    ]);
    if (databaseProduct) return databaseProduct as Product;
    // Do not resurrect hidden/deleted demo products once the live catalogue is populated.
    if (totalProducts > 0) return null;
  } catch {
    // During local demos or before the database is connected, use the clearly labelled demo catalogue.
  }
  return demoProducts.find((product) => product.slug === slug) || null;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) return { title: "Product not found | Saanwariya Seth Fashion" };
  return {
    title: `${product.name} | Saanwariya Seth Fashion`,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description: product.description.slice(0, 155), images: [{ url: resolveProductImage(product) }] },
  };
}
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) notFound();

  let similar: Product[] = [];
  let reviews: Array<{ id: string; rating: number; title: string; comment: string; createdAt: Date; user: { name: string } }> = [];
  let rating = 0;
  let count = 0;
  try {
    const [relatedRows, reviewRows, summary] = await Promise.all([
      prisma.product.findMany({ where: { active: true, category: product.category, id: { not: product.id } }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 4 }),
      prisma.productReview.findMany({ where: { productId: product.id, approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 12 }),
      prisma.productReview.aggregate({ where: { productId: product.id, approved: true }, _avg: { rating: true }, _count: { _all: true } }),
    ]);
    similar = relatedRows as Product[];
    reviews = reviewRows;
    rating = summary._avg.rating || 0;
    count = summary._count._all;
  } catch {
    similar = demoProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  }
  return <div className="container page-wrap pdp-page">
    <div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.name}</span></div>
    <ProductDetail product={product} similar={similar} reviewSummary={{ reviews: reviews.map((review) => ({ ...review, createdAt: review.createdAt.toISOString() })), rating, count }}/>
    <AdUnit slotKey="productBottom" className="pdp-ad-slot"/>
  </div>;
}
