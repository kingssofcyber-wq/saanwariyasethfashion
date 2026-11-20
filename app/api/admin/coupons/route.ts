import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ error: "Coupon table missing. Run npx prisma db push." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase().replace(/\s+/g, "");
    const type = String(body.discountType || "PERCENT");
    const value = Number(body.value);
    const minOrder = Number(body.minOrder || 0);
    if (!/^[A-Z0-9_-]{3,40}$/.test(code) || !["PERCENT", "FIXED"].includes(type) || !Number.isFinite(value) || value <= 0 || (type === "PERCENT" && value > 100) || !Number.isFinite(minOrder) || minOrder < 0) {
      return NextResponse.json({ error: "Enter a valid coupon code, discount and minimum order." }, { status: 400 });
    }
    const coupon = await prisma.coupon.create({ data: {
      code, description: String(body.description || "").slice(0, 500), discountType: type, value, minOrder,
      maxDiscount: body.maxDiscount === "" || body.maxDiscount == null ? null : Number(body.maxDiscount),
      usageLimit: body.usageLimit === "" || body.usageLimit == null ? null : Math.max(1, Number(body.usageLimit)),
      active: body.active !== false,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    } });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Coupon could not be created. The code may already exist." }, { status: 409 });
  }
}
