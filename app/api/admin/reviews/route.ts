import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const reviews = await prisma.productReview.findMany({ include: { product: { select: { name: true, slug: true } }, user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ reviews });
}
