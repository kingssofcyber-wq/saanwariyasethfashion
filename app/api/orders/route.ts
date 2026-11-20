import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 79;
const MAX_QUANTITY_PER_PRODUCT = 10;
const MAX_DISTINCT_PRODUCTS_PER_ORDER = 25;

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CheckoutAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

class OrderRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderRequestError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(
  body: Record<string, unknown>,
  field: keyof CheckoutAddress,
  maxLength: number,
): string {
  const value = body[field];

  if (typeof value !== "string") {
    throw new OrderRequestError(`Please enter your ${field}.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new OrderRequestError(`Please enter your ${field}.`);
  }

  if (trimmed.length > maxLength) {
    throw new OrderRequestError(`${field} is too long.`);
  }

  return trimmed;
}

function parseCheckoutAddress(body: Record<string, unknown>): CheckoutAddress {
  const address: CheckoutAddress = {
    fullName: requiredText(body, "fullName", 120),
    email: requiredText(body, "email", 254).toLowerCase(),
    phone: requiredText(body, "phone", 30),
    address: requiredText(body, "address", 1000),
    city: requiredText(body, "city", 100),
    state: requiredText(body, "state", 100),
    postalCode: requiredText(body, "postalCode", 16),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    throw new OrderRequestError("Please enter a valid email address.");
  }

  const phoneDigits = address.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    throw new OrderRequestError("Please enter a valid phone number.");
  }

  if (!/^[a-zA-Z0-9 -]{4,16}$/.test(address.postalCode)) {
    throw new OrderRequestError("Please enter a valid postal code.");
  }

  return address;
}

function parseCheckoutItems(value: unknown): CheckoutItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new OrderRequestError("Your bag is empty.");
  }

  if (value.length > MAX_DISTINCT_PRODUCTS_PER_ORDER * 2) {
    throw new OrderRequestError("Your bag contains too many line items.");
  }

  // Merge duplicate product IDs so stock is checked against the full quantity.
  const quantities = new Map<string, number>();

  for (const entry of value as unknown[]) {
    if (!isRecord(entry)) {
      throw new OrderRequestError("Your bag contains an invalid product.");
    }

    const id = typeof entry.id === "string" ? entry.id.trim() : "";
    const quantity = Number(entry.quantity);

    if (!id || id.length > 128) {
      throw new OrderRequestError("Your bag contains an invalid product.");
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_PRODUCT) {
      throw new OrderRequestError(
        `Product quantity must be between 1 and ${MAX_QUANTITY_PER_PRODUCT}.`,
      );
    }

    const combinedQuantity = (quantities.get(id) ?? 0) + quantity;
    if (combinedQuantity > MAX_QUANTITY_PER_PRODUCT) {
      throw new OrderRequestError(
        `You can order up to ${MAX_QUANTITY_PER_PRODUCT} units of one product.`,
      );
    }

    quantities.set(id, combinedQuantity);
  }

  if (quantities.size > MAX_DISTINCT_PRODUCTS_PER_ORDER) {
    throw new OrderRequestError(
      `You can order up to ${MAX_DISTINCT_PRODUCTS_PER_ORDER} different products at once.`,
    );
  }

  return Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
}

function createOrderNumber(): string {
  const timePart = Date.now().toString().slice(-8);
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `SSF${timePart}${randomPart}`;
}

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders failed:", error);
    return NextResponse.json(
      { error: "Unable to load your orders right now. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in before placing an order." },
      { status: 401 },
    );
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      throw new OrderRequestError("The checkout request is not valid JSON.");
    }

    if (!isRecord(rawBody)) {
      throw new OrderRequestError("The checkout details are invalid.");
    }

    const address = parseCheckoutAddress(rawBody);
    const cartItems = parseCheckoutItems(rawBody.items);
    const couponCode = typeof rawBody.couponCode === "string" ? rawBody.couponCode.trim().toUpperCase() : "";
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: { shippingFee: true, freeShippingThreshold: true },
    }).catch(() => null);
    const shippingFee = storeSettings?.shippingFee ?? STANDARD_SHIPPING_FEE;
    const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;

    // Always read price, product name and image from the database. Never trust
    // prices sent by the browser when calculating an order total.
    const order = await prisma.$transaction(async (transaction) => {
      const productIds = cartItems.map((item) => item.id);
      const products = await transaction.product.findMany({
        where: {
          id: { in: productIds },
          active: true,
          source: "OWN",
        },
      });

      const productById = new Map(products.map((product) => [product.id, product]));

      if (products.length !== cartItems.length) {
        throw new OrderRequestError(
          "One or more products are unavailable. Please refresh your bag and try again.",
          409,
        );
      }

      const lineItems = cartItems.map((cartItem) => {
        const product = productById.get(cartItem.id);

        if (!product || !product.active) {
          throw new OrderRequestError(
            "One or more products are no longer available.",
            409,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new OrderRequestError(
            `${product.name} does not have enough stock. Available quantity: ${product.stock}.`,
            409,
          );
        }

        return {
          productId: product.id,
          productName: product.name,
          image: product.image,
          price: product.price,
          quantity: cartItem.quantity,
        };
      });

      const subtotal = lineItems.reduce(
        (sum: number, item: (typeof lineItems)[number]) =>
          sum + item.price * item.quantity,
        0,
      );
      const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
      let discount = 0;
      let appliedCouponCode: string | null = null;
      if (couponCode) {
        const coupon = await transaction.coupon.findUnique({ where: { code: couponCode } });
        const now = new Date();
        if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) {
          throw new OrderRequestError("The applied coupon is no longer valid. Please remove it and try again.", 409);
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new OrderRequestError("This coupon has reached its usage limit.", 409);
        }
        if (subtotal < coupon.minOrder) throw new OrderRequestError(`Minimum order for this coupon is ₹${coupon.minOrder}.`, 400);
        const rawDiscount = coupon.discountType === "PERCENT" ? subtotal * coupon.value / 100 : coupon.value;
        discount = Math.round(Math.min(subtotal, coupon.maxDiscount === null ? rawDiscount : Math.min(rawDiscount, coupon.maxDiscount)) * 100) / 100;
        const couponUpdate = await transaction.coupon.updateMany({
          where: { id: coupon.id, active: true, ...(coupon.usageLimit === null ? {} : { usedCount: { lt: coupon.usageLimit } }) },
          data: { usedCount: { increment: 1 } },
        });
        if (couponUpdate.count !== 1) throw new OrderRequestError("This coupon was just used up. Please try another code.", 409);
        appliedCouponCode = coupon.code;
      }
      const total = Math.max(0, subtotal + shipping - discount);

      // Conditional decrement prevents two concurrent checkouts from selling
      // the same final unit. Any failure rolls back the complete transaction.
      for (const item of lineItems) {
        const stockUpdate = await transaction.product.updateMany({
          where: {
            id: item.productId,
            active: true,
            source: "OWN",
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new OrderRequestError(
            `Stock for ${item.productName} has just changed. Please refresh your bag.`,
            409,
          );
        }
      }

      return transaction.order.create({
        data: {
          orderNumber: createOrderNumber(),
          userId: user.id,
          fullName: address.fullName,
          email: address.email,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          subtotal,
          shipping,
          discount,
          couponCode: appliedCouponCode,
          total,
          paymentMethod: "COD",
          items: {
            create: lineItems,
          },
        },
        select: {
          id: true,
          orderNumber: true,
          subtotal: true,
          shipping: true,
          discount: true,
          couponCode: true,
          total: true,
          status: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("POST /api/orders failed:", error);
    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
