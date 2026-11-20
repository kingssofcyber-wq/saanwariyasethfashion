import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const allowed = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type AllowedStatus = (typeof allowed)[number];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  let requestedStatus: string;
  try {
    const body = await request.json();
    requestedStatus = String(body.status || "");
  } catch {
    return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  }
  if (!allowed.includes(requestedStatus as AllowedStatus)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const current = await transaction.order.findUnique({ where: { id }, include: { items: true } });
      if (!current) throw new Error("ORDER_NOT_FOUND");
      if (current.status === "CANCELLED" && requestedStatus !== "CANCELLED") throw new Error("CANCELLED_ORDER_CANNOT_REOPEN");
      if (current.status !== "CANCELLED" && requestedStatus === "CANCELLED") {
        for (const item of current.items) {
          if (item.productId) {
            await transaction.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
        }
      }
      return transaction.order.update({ where: { id }, data: { status: requestedStatus as AllowedStatus }, include: { items: true } });
    });
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (error instanceof Error && error.message === "CANCELLED_ORDER_CANNOT_REOPEN") return NextResponse.json({ error: "A cancelled order cannot be reopened. Create a new order instead." }, { status: 409 });
    return NextResponse.json({ error: "Could not update order status." }, { status: 500 });
  }
}
