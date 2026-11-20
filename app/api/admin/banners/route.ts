import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try { return NextResponse.json({ banners: await prisma.storeBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }) }); }
  catch { return NextResponse.json({ error: "Banner table missing. Run npx prisma db push." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const image = String(body.image || "").trim();
    if (!title || !image) return NextResponse.json({ error: "Banner title and image are required." }, { status: 400 });
    const banner = await prisma.storeBanner.create({ data: {
      title, subtitle: String(body.subtitle || ""), image, href: String(body.href || "/shop"),
      position: String(body.position || "HOME"), active: body.active !== false, sortOrder: Number(body.sortOrder || 0),
    } });
    return NextResponse.json({ banner }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not create banner." }, { status: 500 }); }
}
