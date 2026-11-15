import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CheckoutItemInput = {
  id?: unknown;
  quantity?: unknown;
};

type OrderLineItem = {
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
};

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in before placing an order." },
      { status: 401 },
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
    ] as const;

    for (const field of requiredFields) {
      if (!String(body[field] ?? "").trim()) {
        return NextResponse.json(
          { error: `Please complete ${field}.` },
          { status: 400 },
        );
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty." },
        { status: 400 },
      );
    }

    const requestedItems = body.items as CheckoutItemInput[];
    const ids = requestedItems.map((item) => String(item.id ?? ""));
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, active: true },
    });

    const lineItems: OrderLineItem[] = requestedItems.map((line) => {
      const product = products.find((item) => item.id === String(line.id ?? ""));
      const quantity = Math.max(1, Math.min(10, Number(line.quantity) || 1));

      if (!product || product.stock < quantity) {
        throw new Error(
          "One or more products are unavailable or have insufficient stock.",
        );
      }

      return {
        productId: product.id,
        productName: product.name,
        image: product.image,
        price: product.price,
        quantity,
      };
    });

    const subtotal = lineItems.reduce(
      (sum: number, item: OrderLineItem) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal >= 999 ? 0 : 79;

    const order = await prisma.order.create({
      data: {
        orderNumber: `SSF${Date.now().toString().slice(-8)}`,
        userId: user.id,
        fullName: String(body.fullName),
        email: String(body.email),
        phone: String(body.phone),
        address: String(body.address),
        city: String(body.city),
        state: String(body.state),
        postalCode: String(body.postalCode),
        subtotal,
        shipping,
        total: subtotal + shipping,
        paymentMethod: "COD",
        items: { create: lineItems },
      },
    });

    for (const item of lineItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not place the order.",
      },
      { status: 400 },
    );
  }
}
