import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { categories } from "../lib/catalog";

const prisma = new PrismaClient();

async function main() {
  for (const category of categories) {
    await prisma.storeCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        description: category.note,
        image: category.image,
        active: true,
      },
    });
  }

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Saanwariya Seth Fashion",
      supportEmail: process.env.ADMIN_EMAIL || "support@saanwariyasethfashion.com",
      supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
      address: "",
      announcement: "",
      shippingFee: 79,
      freeShippingThreshold: 999,
    },
  });

  console.log(`Admin data ready: ${categories.length} categories and default store settings.`);
  console.log("Existing products, customers, orders, reviews and admin credentials were not changed.");
}

main()
  .catch((error) => {
    console.error("Admin data initialization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
