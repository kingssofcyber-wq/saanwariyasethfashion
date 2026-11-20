import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const [categories, productCounts] = await Promise.all([
      prisma.storeCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
    ]);
    const counts = new Map(productCounts.map((entry) => [entry.category, entry._count._all]));
    return NextResponse.json({ categories: categories.map((category) => ({ ...category, productCount: counts.get(category.name) || 0 })) });
  } catch {
    return NextResponse.json({ error: "Category table missing. Run npx prisma db push and seed categories." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const image = String(body.image || "").trim();
    const slug = String(body.slug || name).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
    if (name.length < 2 || !slug || !image) return NextResponse.json({ error: "Category name and image are required." }, { status: 400 });
    const category = await prisma.storeCategory.create({ data: { name, slug, image, description: String(body.description || "").slice(0, 500), sortOrder: Number(body.sortOrder || 0), active: body.active !== false } });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Category could not be saved. Name or slug may already exist." }, { status: 409 });
  }
}
