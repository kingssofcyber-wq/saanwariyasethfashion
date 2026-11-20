import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  try {
    const customers = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true, name: true, email: true, createdAt: true,
        _count: { select: { orders: true, reviews: true } },
        orders: { select: { total: true }, orderBy: { createdAt: "desc" }, take: 100 },
      },
      orderBy: { createdAt: "desc" }, take: 500,
    });
    return NextResponse.json({ customers: customers.map((customer) => ({
      ...customer,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      orders: undefined,
    })) });
  } catch {
    return NextResponse.json({ error: "Could not load customers." }, { status: 503 });
  }
}
