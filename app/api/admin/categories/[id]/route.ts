import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const data: any = {};
    for (const key of ["name", "slug", "description", "image"] as const) if (typeof body[key] === "string") data[key] = body[key];
    if (typeof body.name === "string" && typeof body.slug !== "string") data.slug = body.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
    return NextResponse.json({ category: await prisma.storeCategory.update({ where: { id }, data }) });
  } catch {
    return NextResponse.json({ error: "Category not found or update failed." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.storeCategory.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }
}
