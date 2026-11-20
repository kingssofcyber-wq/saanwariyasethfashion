import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal);
    if (!code || !Number.isFinite(subtotal) || subtotal <= 0) return NextResponse.json({ error: "Enter a coupon code and a valid order subtotal." }, { status: 400 });
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    const now = new Date();
    if (!coupon || !coupon.active) return NextResponse.json({ error: "This coupon is not available." }, { status: 404 });
    if (coupon.startsAt && coupon.startsAt > now) return NextResponse.json({ error: "This coupon is not active yet." }, { status: 400 });
    if (coupon.endsAt && coupon.endsAt < now) return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    if (subtotal < coupon.minOrder) return NextResponse.json({ error: `Minimum order for this coupon is ₹${coupon.minOrder}.` }, { status: 400 });
    const rawDiscount = coupon.discountType === "PERCENT" ? subtotal * coupon.value / 100 : coupon.value;
    const discount = Math.min(subtotal, coupon.maxDiscount === null ? rawDiscount : Math.min(rawDiscount, coupon.maxDiscount));
    return NextResponse.json({ coupon: { code: coupon.code, discountType: coupon.discountType, value: coupon.value }, discount: Math.round(discount * 100) / 100 });
  } catch {
    return NextResponse.json({ error: "Coupon validation is temporarily unavailable." }, { status: 503 });
  }
}
