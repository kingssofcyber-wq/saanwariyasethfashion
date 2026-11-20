import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.description === "string") data.description = body.description.slice(0, 500);
    if (typeof body.value === "number" && Number.isFinite(body.value) && body.value > 0) data.value = body.value;
    if (typeof body.minOrder === "number" && body.minOrder >= 0) data.minOrder = body.minOrder;
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Coupon not found or update failed." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }
}
