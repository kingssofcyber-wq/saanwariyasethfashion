import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const [products, activeProducts, users, orders, pendingOrders, lowStock, revenue, recentOrders, recentProducts, pendingReviews, newMessages] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PLACED", "CONFIRMED"] } } }),
      prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
      prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { items: true } }),
      prisma.product.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
      prisma.productReview.count({ where: { approved: false } }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
    ]);

    return NextResponse.json({
      stats: {
        products, activeProducts, users, orders, pendingOrders, lowStock,
        revenue: revenue._sum.total ?? 0, pendingReviews, newMessages,
      },
      recentOrders,
      recentProducts,
    });
  } catch {
    return NextResponse.json({ error: "Could not load dashboard data. Check database connection." }, { status: 503 });
  }
}
