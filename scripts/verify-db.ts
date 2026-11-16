import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@saanwariyasethfashion.com").trim().toLowerCase();
  const [users, products, orders, orderItems, contactMessages, reviews, admin] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.contactMessage.count(),
    prisma.productReview.count(),
    prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true } }),
  ]);

  console.log("\nSaanwariya Seth Fashion database verification\n");
  console.table([
    { table: "User", rows: users },
    { table: "Product", rows: products },
    { table: "Order", rows: orders },
    { table: "OrderItem", rows: orderItems },
    { table: "ContactMessage", rows: contactMessages },
    { table: "ProductReview", rows: reviews },
  ]);

  if (!admin || admin.role !== "ADMIN") {
    throw new Error(`Admin ${email} was not found with ADMIN role. Run npm run db:admin:reset with the same DATABASE_URL and ADMIN_PASSWORD as the live application.`);
  }

  console.log(`Admin ready: ${admin.name} <${admin.email}> (${admin.role})`);
  if (products < 30) console.warn(`Only ${products} products found; run npm run db:seed to add the 30 demo products.`);
}

main()
  .catch((error) => {
    console.error("Database verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
