import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import ReportView from "./ReportView";
import { redirect } from "next/navigation";

export default async function OAGReportPage() {
  const session = await auth();
  if (!session || session.user.role === "DRIVER") {
    redirect("/dashboard");
  }

  const role = session.user.role;
  const department = session.user.department;
  const whereClause = role === "ADMIN" ? {} : { department };

  // ดึงข้อมูลรถทั้งหมด พร้อมประวัติการเติมน้ำมัน การเดินทาง และการซ่อมบำรุง
  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    include: {
      fuelLogs: true,
      tripLogs: true,
      maintenanceLogs: true,
    },
    orderBy: { licensePlate: "asc" },
  });

  // หาชื่อผู้อำนวยการกองของ user ที่ล็อกอินอยู่
  let managerName = "";
  if (department) {
    const manager = await prisma.user.findFirst({
      where: { department, role: "MANAGER" }
    });
    if (manager) {
      managerName = manager.name;
    }
  }

  const currentUser = {
    name: session.user.name,
    role: session.user.role,
    department: session.user.department || "กอง",
  };

  return <ReportView vehicles={vehicles} role={role} department={department || "กอง"} currentUser={currentUser} managerName={managerName} />;
}
