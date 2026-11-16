import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@saanwariyasethfashion.com").trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || "";
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error(`No database user found for ${email}. Run npm run db:admin:reset using the correct DATABASE_URL.`);
  }
  if (user.role !== "ADMIN") {
    throw new Error(`The account exists but its role is ${user.role}, not ADMIN. Run npm run db:admin:reset.`);
  }

  console.log(`Admin record found: ${user.email} (${user.role})`);
  if (configuredPassword) {
    const matches = await bcrypt.compare(configuredPassword, user.passwordHash);
    console.log(`ADMIN_PASSWORD matches database hash: ${matches ? "YES" : "NO"}`);
    if (!matches) throw new Error("The environment ADMIN_PASSWORD does not match the saved database password. Run npm run db:admin:reset.");
  } else {
    console.warn("ADMIN_PASSWORD is not set in this shell; password comparison skipped.");
  }
}

main()
  .catch((error) => {
    console.error("Admin verification failed:", error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
