// src/app/dashboard/approvals/page.tsx
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import ApprovalsClient from "./ApprovalsClient";

export default async function ApprovalsPage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  if (role === "OFFICER" || role === "DRIVER") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-md border text-center">
        <h2 className="text-xl font-bold text-red-600">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500 mt-2">เฉพาะผู้ดูแลระบบและผู้อำนวยการเท่านั้นที่สามารถพิจารณาอนุมัติคำขอได้</p>
      </div>
    );
  }

  // คัดกรองตามหน่วยงาน (ยกเว้น ADMIN)
  const whereClause = role === "ADMIN" ? {} : { department };

  // 1. ดึงข้อมูลคำขอใช้รถทั้งหมด
  const vehicleRequests = await prisma.vehicleRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
    }
  });

  // 2. ดึงข้อมูลบันทึกการเติมน้ำมันทั้งหมด
  const fuelRequests = await prisma.fuelLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
    },
  });

  // 3. ดึงข้อมูลรถยนต์ทั้งหมดสำหรับใช้ในการจัดสรร
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { licensePlate: "asc" },
  });

  return (
    <ApprovalsClient
      initialVehicleRequests={vehicleRequests}
      initialFuelLogs={fuelRequests}
      vehicles={vehicles}
      role={role || "DRIVER"}
      department={department || ""}
    />
  );
}