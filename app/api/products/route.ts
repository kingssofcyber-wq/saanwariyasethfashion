import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { demoProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function galleryValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    const images = value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
    return images.length ? JSON.stringify(images) : null;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, 12));
    } catch {
      const images = value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
      return images.length ? JSON.stringify(images) : null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const category = params.get("category")?.trim();
  try {
    const products = await prisma.product.findMany({
      where: { active: true, ...(category ? { category: { equals: category } } : {}), ...(q ? { OR: [{ name: { contains: q } }, { brand: { contains: q } }, { category: { contains: q } }] } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products, source: "database" });
  } catch {
    return NextResponse.json({ products: demoProducts, source: "demo" });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const image = String(body.image || "").trim();
    const price = Number(body.price);
    const mrp = Number(body.mrp);
    const stock = Number(body.stock ?? 0);
    if (name.length < 2 || category.length < 2 || !image || !Number.isFinite(price) || price <= 0 || !Number.isFinite(mrp) || mrp < price || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "Enter a valid product name, category, image, price, MRP and stock quantity." }, { status: 400 });
    }
    const baseSlug = String(body.slug || name).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || "product";
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
    const product = await prisma.product.create({ data: {
      slug, name, brand: String(body.brand || "Saanwariya Select").trim(),
      description: String(body.description || "A handpicked find from Saanwariya Seth Fashion."),
      category, price, mrp, image, images: galleryValue(body.images), stock,
      featured: Boolean(body.featured), active: body.active !== false,
      source: body.source === "FLIPKART" ? "FLIPKART" : "OWN",
      externalUrl: body.source === "FLIPKART" && body.externalUrl ? String(body.externalUrl) : null,
    } });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save product. Check the database connection and try again." }, { status: 500 });
  }
}
