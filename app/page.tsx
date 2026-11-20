import { prisma } from "@/lib/prisma";
import { demoProducts, type Product } from "@/lib/catalog";
import { Hero, MarqueeStrip, CategorySection, PromoCollections, FeaturedSection, NewArrivalsSection, EditorialBanner, SaleFeature, MarketplaceBanner, TrustStrip, ClosingNote, AdminManagedBanners } from "@/components/home-sections";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AdUnit } from "@/components/adsense";
import { JsonLd } from "@/components/json-ld";
import { getHomepageSchema } from "@/lib/structured-data";
import { categories as fallbackCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

async function getHomeProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({ where: { active: true }, orderBy: [{ createdAt: "desc" }], take: 40 });
    return rows.length ? rows as Product[] : demoProducts;
  } catch {
    return demoProducts;
  }
}

async function getHomepageContent() {
  try {
    const [dbCategories, banners] = await Promise.all([
      prisma.storeCategory.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.storeBanner.findMany({ where: { active: true, position: "HOME" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 3 }),
    ]);
    const categoryItems = dbCategories.length ? dbCategories.map((category) => ({ name: category.name, image: category.image, href: `/shop?category=${encodeURIComponent(category.name)}` })) : fallbackCategories.map((category) => ({ name: category.name, image: category.image, href: `/shop?category=${encodeURIComponent(category.name)}` }));
    return { categoryItems, banners };
  } catch {
    return { categoryItems: fallbackCategories.map((category) => ({ name: category.name, image: category.image, href: `/shop?category=${encodeURIComponent(category.name)}` })), banners: [] };
  }
}

export default async function Home() {
  const [products, content] = await Promise.all([getHomeProducts(), getHomepageContent()]);
  const newArrivals = products.slice(0, 8);
  const newArrivalIds = new Set(newArrivals.map((product) => product.id));
  const customerFavourites = products.filter((product) => product.featured && !newArrivalIds.has(product.id)).slice(0, 8);
  return <>
    <JsonLd data={getHomepageSchema(products)} />
    <Hero />
    <AdUnit slotKey="homeTop" className="home-ad-slot" />
    <TrustStrip />
    <ScrollReveal><CategorySection items={content.categoryItems} /></ScrollReveal>
    <AdminManagedBanners banners={content.banners} />
    <ScrollReveal delay={60}><PromoCollections /></ScrollReveal>
    <MarqueeStrip />
    <ScrollReveal><NewArrivalsSection products={newArrivals} /></ScrollReveal>
    <ScrollReveal><SaleFeature /></ScrollReveal>
    <ScrollReveal><FeaturedSection products={customerFavourites} /></ScrollReveal>
    <ScrollReveal><EditorialBanner /></ScrollReveal>
    <ScrollReveal><MarketplaceBanner /></ScrollReveal>
    <AdUnit slotKey="homeMid" className="home-ad-slot" />
    <ClosingNote />
  </>;
}
