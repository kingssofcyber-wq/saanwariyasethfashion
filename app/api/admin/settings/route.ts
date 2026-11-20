import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const defaults = {
  id: "default", storeName: "Saanwariya Seth Fashion", supportEmail: "support@saanwariyasethfashion.com",
  supportPhone: "", address: "", announcement: "", shippingFee: 79, freeShippingThreshold: 999,
  instagramUrl: null, facebookUrl: null, youtubeUrl: null,
};

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const settings = await prisma.storeSettings.upsert({ where: { id: "default" }, create: defaults, update: {} });
    return NextResponse.json({ settings });
  } catch { return NextResponse.json({ error: "Settings table missing. Run npx prisma db push." }, { status: 503 }); }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const body = await request.json();
    const shippingFee = Number(body.shippingFee);
    const freeShippingThreshold = Number(body.freeShippingThreshold);
    if (!Number.isFinite(shippingFee) || shippingFee < 0 || !Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) {
      return NextResponse.json({ error: "Enter valid shipping values." }, { status: 400 });
    }
    const data = {
      storeName: String(body.storeName || defaults.storeName).trim().slice(0, 180),
      supportEmail: String(body.supportEmail || defaults.supportEmail).trim().slice(0, 191),
      supportPhone: String(body.supportPhone || "").trim().slice(0, 40),
      address: String(body.address || "").slice(0, 4000),
      announcement: String(body.announcement || "").slice(0, 2000),
      shippingFee, freeShippingThreshold,
      instagramUrl: body.instagramUrl ? String(body.instagramUrl).slice(0, 1000) : null,
      facebookUrl: body.facebookUrl ? String(body.facebookUrl).slice(0, 1000) : null,
      youtubeUrl: body.youtubeUrl ? String(body.youtubeUrl).slice(0, 1000) : null,
    };
    const settings = await prisma.storeSettings.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
    return NextResponse.json({ settings });
  } catch { return NextResponse.json({ error: "Could not save store settings." }, { status: 500 }); }
}
