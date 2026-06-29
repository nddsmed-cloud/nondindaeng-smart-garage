import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin1234", 12);
  const password1234 = await bcrypt.hash("password1234", 12);
  
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "ผู้ดูแลระบบ",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      department: "สำนักปลัดเทศบาล",
    },
  });

  await prisma.user.upsert({
    where: { username: "sorapong" },
    update: {},
    create: {
      name: "สรพงษ์ พัฒนะแสง",
      username: "sorapong",
      password: password1234,
      role: "MANAGER",
      department: "กองช่าง",
    },
  });

  console.log("Seeded default users.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
