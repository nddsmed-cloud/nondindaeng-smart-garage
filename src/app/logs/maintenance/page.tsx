import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import MaintenanceTable from "./MaintenanceTable";

export default async function MaintenancePage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  // กรองข้อมูลตามแผนก (Data Isolation)
  // ADMIN เห็นทั้งหมด, คนอื่นๆ เห็นเฉพาะรถของกองตัวเอง
  const whereClause = role === "ADMIN" ? {} : { department };

  const logs = await prisma.maintenanceLog.findMany({
    where: whereClause,
    orderBy: { maintenanceDate: "desc" },
    include: { vehicle: true },
  });

  const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">ประวัติการซ่อมบำรุง (แบบ ๖) {role !== "ADMIN" && department ? `- ${department}` : ""}</h1>
          <p className="page-subtitle">
            รวมค่าซ่อมบำรุงทั้งหมด <strong style={{ color: "var(--red)" }}>{totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</strong> บาท
          </p>
        </div>
        {role !== "DRIVER" && (
          <Link href="/logs/maintenance/new" className="btn btn-primary">
            + บันทึกการซ่อมบำรุง
          </Link>
        )}
      </div>

      <MaintenanceTable logs={logs} role={role || "DRIVER"} />
    </>
  );
}
