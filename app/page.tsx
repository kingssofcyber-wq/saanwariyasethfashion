import { prisma } from "@/lib/prisma";
import { demoProducts, type Product } from "@/lib/catalog";
import { Hero, MarqueeStrip, CategorySection, PromoCollections, FeaturedSection, NewArrivalsSection, EditorialBanner, SaleFeature, MarketplaceBanner, TrustStrip, ClosingNote } from "@/components/home-sections";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AdUnit } from "@/components/adsense";
import { JsonLd } from "@/components/json-ld";
import { getHomepageSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

async function getHomeProducts(): Promise<Product[]> {
  try {
    const rows = await prisma.product.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 40 });
    return rows.length ? rows as Product[] : demoProducts;
  } catch {
    return demoProducts;
  }
}

export default async function Home() {
  const products = await getHomeProducts();
  return <>
    <JsonLd data={getHomepageSchema(products)} />
    <Hero />
    <AdUnit slotKey="homeTop" className="home-ad-slot" />
    <TrustStrip />
    <ScrollReveal><CategorySection /></ScrollReveal>
    <ScrollReveal delay={60}><PromoCollections /></ScrollReveal>
    <MarqueeStrip />
    <ScrollReveal><NewArrivalsSection products={products} /></ScrollReveal>
    <ScrollReveal><SaleFeature /></ScrollReveal>
    <ScrollReveal><FeaturedSection products={products.slice(0, 24)} /></ScrollReveal>
    <ScrollReveal><EditorialBanner /></ScrollReveal>
    <ScrollReveal><MarketplaceBanner /></ScrollReveal>
    <AdUnit slotKey="homeMid" className="home-ad-slot" />
    <ClosingNote />
  </>;
}
