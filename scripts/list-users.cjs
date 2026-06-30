const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      department: "กองช่าง",
      NOT: [
        { role: "ADMIN" },
        { role: "MANAGER" }
      ]
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      department: true
    }
  });
  console.log("USERS_LIST:", JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
