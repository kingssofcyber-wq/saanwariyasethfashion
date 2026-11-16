import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const review = await prisma.productReview.update({ where: { id }, data: { approved: Boolean(body.approved) } });
    return NextResponse.json({ review });
  } catch { return NextResponse.json({ error: "Review not found or update failed." }, { status: 404 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try { await prisma.productReview.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Review not found or delete failed." }, { status: 404 }); }
}
