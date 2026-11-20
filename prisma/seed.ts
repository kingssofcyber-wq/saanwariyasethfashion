import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories, demoProducts, getProductGalleryImages } from "../lib/catalog";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@saanwariyasethfashion.com").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME || "Mivaan Jangra").trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (!password || password === "SET_A_UNIQUE_ADMIN_PASSWORD_BEFORE_SEEDING") {
    throw new Error("Set a private ADMIN_PASSWORD in .env or Hostinger Environment Variables before running the database seed.");
  }
  if (password.length < 16) {
    throw new Error("ADMIN_PASSWORD must be at least 16 characters long.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN" },
    create: { name, email, passwordHash, role: "ADMIN" },
  });

  for (const category of categories) {
    await prisma.storeCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.note, image: category.image, active: true },
      create: { name: category.name, slug: category.slug, description: category.note, image: category.image, active: true },
    });
  }

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Saanwariya Seth Fashion",
      supportEmail: "support@saanwariyasethfashion.com",
      supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
      address: "",
      announcement: "",
      shippingFee: 79,
      freeShippingThreshold: 999,
    },
  });

  for (const product of demoProducts) {
    const productData = {
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      images: JSON.stringify(getProductGalleryImages(product)),
      stock: product.stock,
      featured: product.featured,
      active: true,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: productData,
      create: { slug: product.slug, ...productData },
    });
  }

  console.log(`Database seed complete: admin ${email} and ${demoProducts.length} demo products are ready.`);
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
