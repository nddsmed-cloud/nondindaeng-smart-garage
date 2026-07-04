const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Testing connection via Prisma...");
    const count = await prisma.vehicle.count();
    console.log("SUCCESS! Connected! Vehicle count:", count);
  } catch (err) {
    console.error("FAILED to connect:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
