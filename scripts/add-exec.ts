import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password1234", 12);
  
  await prisma.user.upsert({
    where: { username: "sorapong" },
    update: {
      name: "สรพงษ์ พัฒนะแสง",
      role: "MANAGER",
      department: "กองช่าง",
    },
    create: {
      name: "สรพงษ์ พัฒนะแสง",
      username: "sorapong",
      password: hashedPassword,
      role: "MANAGER",
      department: "กองช่าง",
    },
  });

  console.log("Upserted user sorapong successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
