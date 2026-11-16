import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@saanwariyasethfashion.com").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME || "Mivaan Jangra").trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (
    password.length < 16 ||
    password === "SET_A_UNIQUE_ADMIN_PASSWORD_BEFORE_SEEDING" ||
    /^(change|replace|your|set_a_unique)|placeholder/i.test(password)
  ) {
    throw new Error("Set ADMIN_PASSWORD to a private, unique password of at least 16 characters; do not use the .env.example placeholder.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. This script must use the same database as the website you want to sign in to.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN" },
    create: { name, email, passwordHash, role: "ADMIN" },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log("Admin account reset successfully.");
  console.log(`Email: ${admin.email}`);
  console.log(`Name: ${admin.name}`);
  console.log(`Role: ${admin.role}`);
  console.log("Password: updated (not displayed).");
  console.log("Reminder: ensure the live Hostinger application uses the same ADMIN_EMAIL and the matching AUTH_SECRET.");
}

main()
  .catch((error) => {
    console.error("Admin reset failed:", error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
