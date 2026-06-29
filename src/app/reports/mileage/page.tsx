import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import MileageLogView from "./MileageLogView";
import { redirect } from "next/navigation";

export default async function MileageReportPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const department = session.user.department;
  
  // กรองตามกอง ยกเว้น ADMIN
  const whereClause = role === "ADMIN" ? {} : { department };

  // ดึงข้อมูลรถพร้อมประวัติการเดินทางและเติมน้ำมัน
  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    include: {
      fuelLogs: true,
      tripLogs: true,
    },
    orderBy: { licensePlate: "asc" },
  });

  return <MileageLogView vehicles={vehicles} role={role} department={department || "กอง"} />;
}
