import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  { name: "Admin User", email: "admin@nexus.com", password: "admin123", role: "ADMIN" as Role },
  { name: "Sales User", email: "sales@nexus.com", password: "sales123", role: "SALES" as Role },
  { name: "Warehouse User", email: "warehouse@nexus.com", password: "warehouse123", role: "WAREHOUSE" as Role },
  { name: "Accounts User", email: "accounts@nexus.com", password: "accounts123", role: "ACCOUNTS" as Role },
];

async function main() {
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: await bcrypt.hash(u.password, 10) },
    });
    console.log(`Seeded: ${u.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
