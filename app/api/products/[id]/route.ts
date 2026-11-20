import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function galleryValue(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    const images = value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
    return images.length ? JSON.stringify(images) : null;
  }
  if (typeof value === "string") {
    if (!value.trim()) return null;
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, 12));
    } catch {
      return JSON.stringify(value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean).slice(0, 12));
    }
  }
  return null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.brand === "string") data.brand = body.brand.trim();
    if (typeof body.description === "string") data.description = body.description;
    if (typeof body.category === "string") data.category = body.category.trim();
    if (typeof body.image === "string") data.image = body.image.trim();
    if (body.images !== undefined) data.images = galleryValue(body.images);
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Selling price must be greater than zero." }, { status: 400 });
      data.price = price;
    }
    if (body.mrp !== undefined) {
      const mrp = Number(body.mrp);
      if (!Number.isFinite(mrp) || mrp <= 0) return NextResponse.json({ error: "MRP must be greater than zero." }, { status: 400 });
      data.mrp = mrp;
    }
    if (typeof body.stock === "number" || typeof body.stock === "string") {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) return NextResponse.json({ error: "Stock must be a whole number zero or greater." }, { status: 400 });
      data.stock = stock;
    }
    if (typeof body.featured === "boolean") data.featured = body.featured;
    if (typeof body.active === "boolean") data.active = body.active;
    if (body.source === "OWN" || body.source === "FLIPKART") data.source = body.source;
    if (typeof body.externalUrl === "string" || body.externalUrl === null) data.externalUrl = body.externalUrl;
    const current = await prisma.product.findUnique({ where: { id }, select: { price: true, mrp: true } });
    if (!current) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const finalPrice = typeof data.price === "number" ? data.price : current.price;
    const finalMrp = typeof data.mrp === "number" ? data.mrp : current.mrp;
    if (finalMrp < finalPrice) return NextResponse.json({ error: "MRP cannot be lower than the selling price." }, { status: 400 });
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}
