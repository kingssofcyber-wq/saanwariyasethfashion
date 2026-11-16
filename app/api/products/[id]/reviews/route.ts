import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [reviews, summary] = await Promise.all([
    prisma.productReview.findMany({ where: { productId: id, approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.productReview.aggregate({ where: { productId: id, approved: true }, _avg: { rating: true }, _count: { _all: true } }),
  ]);
  return NextResponse.json({ reviews, rating: summary._avg.rating || 0, count: summary._count._all });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in to review a product." }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json();
    const rating = Number(body.rating);
    const title = String(body.title || "").trim().slice(0, 90);
    const comment = String(body.comment || "").trim().slice(0, 1800);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || title.length < 3 || comment.length < 12) {
      return NextResponse.json({ error: "Choose 1–5 stars and add a short title and a review of at least 12 characters." }, { status: 400 });
    }
    const deliveredOrder = await prisma.order.findFirst({
      where: { userId: user.id, status: "DELIVERED", items: { some: { productId: id } } },
      select: { id: true },
    });
    if (!deliveredOrder) return NextResponse.json({ error: "Only customers with a delivered order for this product can submit a review." }, { status: 403 });
    const existing = await prisma.productReview.findUnique({ where: { productId_userId: { productId: id, userId: user.id } } });
    if (existing) return NextResponse.json({ error: "You have already submitted a review for this product." }, { status: 409 });
    const review = await prisma.productReview.create({ data: { productId: id, userId: user.id, rating, title, comment, approved: false } });
    return NextResponse.json({ ok: true, message: "Thank you. Your verified-purchase review has been sent for moderation." , reviewId: review.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not submit the review. Please try again." }, { status: 500 });
  }
}
