
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("DATABASE_CHECK_FAILED:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed. Check Vercel Runtime Logs.",
      },
      { status: 500 }
    );
  }
}
