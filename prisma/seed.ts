import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      department: "",
    },
    create: {
      name: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      department: "",
    },
  });

  console.log("✅ สร้าง Account เริ่มต้นสำเร็จ");
  console.log({
    username: admin.username,
    role: admin.role,
  });

  // นำเข้าข้อมูลถนน ทถ.3
  const roadsJsonPath = path.join(__dirname, "roads-data.json");
  if (!fs.existsSync(roadsJsonPath)) {
    console.log("⚠️ ไม่พบไฟล์ roads-data.json ข้ามการนำเข้าข้อมูลถนน");
    return;
  }

  const roadsData = JSON.parse(fs.readFileSync(roadsJsonPath, "utf-8"));
  console.log(`⏳ กำลังนำเข้าข้อมูลถนน ${roadsData.length} สาย...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const road of roadsData) {
    let existingAsset = null;

    if (road.routeCode) {
      const reg = await prisma.roadRegistration.findFirst({
        where: { routeCode: road.routeCode },
        include: { asset: true },
      });
      if (reg) existingAsset = reg.asset;
    } else {
      existingAsset = await prisma.infraAsset.findFirst({
        where: { name: road.name },
      });
    }

    const regData = {
      routeCode: road.routeCode || null,
      lengthKm: road.lengthKm ? parseFloat(road.lengthKm) : null,
      surfaceType: road.surfaceType || null,
      pavementWidth: road.pavementWidth ? parseFloat(road.pavementWidth) : null,
      rightOfWayWidth: road.rightOfWayWidth ? parseFloat(road.rightOfWayWidth) : null,
    };

    if (existingAsset) {
      // อัปเดตข้อมูลสายทางที่มีอยู่แล้ว
      await prisma.infraAsset.update({
        where: { id: existingAsset.id },
        data: { name: road.name },
      });

      await prisma.roadRegistration.upsert({
        where: { assetId: existingAsset.id },
        update: regData,
        create: {
          assetId: existingAsset.id,
          status: "APPROVED",
          ...regData,
        },
      });
      updatedCount++;
    } else {
      // สร้างสายทางใหม่
      const asset = await prisma.infraAsset.create({
        data: {
          name: road.name,
          path: [],
        },
      });

      await prisma.roadRegistration.create({
        data: {
          assetId: asset.id,
          status: "APPROVED",
          ...regData,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ นำเข้าข้อมูลถนนสำเร็จ: สร้างใหม่ ${createdCount} สาย, อัปเดต ${updatedCount} สาย`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
