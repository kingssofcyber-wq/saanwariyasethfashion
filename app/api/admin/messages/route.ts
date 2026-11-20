import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Could not load messages. Run Prisma db push first." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const id = String(body.id || "");
    const status = String(body.status || "");
    if (!id || !["NEW", "READ", "RESOLVED"].includes(status)) return NextResponse.json({ error: "Invalid message update." }, { status: 400 });
    const message = await prisma.contactMessage.update({ where: { id }, data: { status } });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Could not update message." }, { status: 404 });
  }
}
