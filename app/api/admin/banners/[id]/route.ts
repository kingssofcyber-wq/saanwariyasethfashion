import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    for (const key of ["title", "subtitle", "image", "href", "position"] as const) {
      if (typeof body[key] === "string") data[key] = body[key];
    }
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
    const banner = await prisma.storeBanner.update({ where: { id }, data });
    return NextResponse.json({ banner });
  } catch {
    return NextResponse.json({ error: "Banner not found or update failed." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.storeBanner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Banner not found." }, { status: 404 });
  }
}
