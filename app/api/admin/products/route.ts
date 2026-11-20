import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const status = request.nextUrl.searchParams.get("status");
  const category = request.nextUrl.searchParams.get("category");
  const where = {
    ...(status === "active" ? { active: true } : status === "hidden" ? { active: false } : {}),
    ...(category && category !== "all" ? { category } : {}),
    ...(query ? { OR: [{ name: { contains: query } }, { brand: { contains: query } }, { category: { contains: query } }, { slug: { contains: query } }] } : {}),
  };
  try {
    const products = await prisma.product.findMany({ where, orderBy: [{ updatedAt: "desc" }], take: 500 });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Could not load products." }, { status: 503 });
  }
}
