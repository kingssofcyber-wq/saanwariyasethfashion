import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    return NextResponse.json({
      storeName: settings?.storeName || "Saanwariya Seth Fashion",
      supportEmail: settings?.supportEmail || "support@saanwariyasethfashion.com",
      supportPhone: settings?.supportPhone || "",
      announcement: settings?.announcement || "",
      shippingFee: settings?.shippingFee ?? 79,
      freeShippingThreshold: settings?.freeShippingThreshold ?? 999,
      instagramUrl: settings?.instagramUrl || "",
      facebookUrl: settings?.facebookUrl || "",
      youtubeUrl: settings?.youtubeUrl || "",
    }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ storeName: "Saanwariya Seth Fashion", announcement: "", shippingFee: 79, freeShippingThreshold: 999 });
  }
}
