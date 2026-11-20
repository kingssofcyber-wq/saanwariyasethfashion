import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const requiredColumns: Record<string, string[]> = {
  User: ["id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt"],
  Product: ["id", "slug", "name", "brand", "description", "category", "price", "mrp", "image", "images", "source", "externalUrl", "stock", "featured", "active", "createdAt", "updatedAt"],
  Order: ["id", "orderNumber", "userId", "fullName", "email", "phone", "address", "city", "state", "postalCode", "subtotal", "shipping", "discount", "couponCode", "total", "paymentMethod", "status", "createdAt", "updatedAt"],
  OrderItem: ["id", "orderId", "productId", "productName", "image", "price", "quantity"],
  ContactMessage: ["id", "name", "email", "subject", "message", "status", "createdAt"],
  ProductReview: ["id", "productId", "userId", "rating", "title", "comment", "approved", "createdAt"],
  Coupon: ["id", "code", "description", "discountType", "value", "minOrder", "maxDiscount", "usageLimit", "usedCount", "active", "startsAt", "endsAt", "createdAt", "updatedAt"],
  StoreBanner: ["id", "title", "subtitle", "image", "href", "position", "active", "sortOrder", "createdAt", "updatedAt"],
  StoreSettings: ["id", "storeName", "supportEmail", "supportPhone", "address", "announcement", "shippingFee", "freeShippingThreshold", "instagramUrl", "facebookUrl", "youtubeUrl", "updatedAt"],
  StoreCategory: ["id", "name", "slug", "description", "image", "active", "sortOrder", "createdAt", "updatedAt"],
};

type ColumnRow = { table_name: string; column_name: string };

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ adminAuthorized: false, databaseConnected: null, schemaReady: null, missingTables: [], missingColumns: [], error: "Admin access required. Sign in again with an administrator account." }, { status: 403 });
  }

  try {
    await prisma.$queryRaw<Array<{ connected: number }>>`SELECT 1 AS connected`;
    const rows = await prisma.$queryRaw<ColumnRow[]>`
      SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
    `;

    const existing = new Map<string, Set<string>>();
    for (const row of rows) {
      const table = row.table_name.toLowerCase();
      if (!existing.has(table)) existing.set(table, new Set());
      existing.get(table)!.add(row.column_name.toLowerCase());
    }

    const missingTables: string[] = [];
    const missingColumns: string[] = [];
    for (const [table, columns] of Object.entries(requiredColumns)) {
      const available = existing.get(table.toLowerCase());
      if (!available) {
        missingTables.push(table);
        continue;
      }
      for (const column of columns) {
        if (!available.has(column.toLowerCase())) missingColumns.push(`${table}.${column}`);
      }
    }

    const schemaReady = missingTables.length === 0 && missingColumns.length === 0;
    return NextResponse.json({
      adminAuthorized: true,
      databaseConnected: true,
      schemaReady,
      missingTables,
      missingColumns,
      message: schemaReady
        ? "The database is reachable and all admin tables/columns required by this release were found."
        : "The database is reachable, but its schema is older than the current admin dashboard.",
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code || "DATABASE_ERROR") : "DATABASE_ERROR";
    return NextResponse.json({
      adminAuthorized: true,
      databaseConnected: false,
      schemaReady: false,
      missingTables: [],
      missingColumns: [],
      code,
      message: "Could not query the production MySQL database. Check the Hostinger DATABASE_URL, database permissions and runtime logs.",
    }, { status: 503 });
  }
}
