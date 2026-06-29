import { prisma } from "../../lib/prisma";
import Link from "next/link";
import VehiclesTable from "./VehiclesTable";
import { auth } from "../../auth";

export default async function VehiclesPage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  // กรองข้อมูลตามแผนกยกเว้น ADMIN
  const whereClause = role === "ADMIN" ? {} : { department };

  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
        <div className="page-header">
        <div>
          <h1 className="page-title">ทะเบียนรถยนต์ {role !== "ADMIN" && department ? `- ${department}` : ""}</h1>
          <p className="page-subtitle">รายการรถยนต์ในระบบ</p>
        </div>
        {role === "ADMIN" && (
          <Link href="/vehicles/create" className="btn btn-primary">
            + เพิ่มรถคันใหม่
          </Link>
        )}
      </div>

      <VehiclesTable vehicles={vehicles} role={role || "DRIVER"} />
    </>
  );
}
