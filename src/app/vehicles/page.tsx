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
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {(role === "ADMIN" || role === "MANAGER" || role === "OFFICER") && (
            <Link href="/requests" className="btn btn-secondary">
              📝 คำขอใช้รถยนต์
            </Link>
          )}
          {role === "ADMIN" && (
            <Link href="/vehicles/create" className="btn btn-primary">
              + เพิ่มรถคันใหม่
            </Link>
          )}
        </div>
      </div>

      <VehiclesTable vehicles={vehicles} role={role || "DRIVER"} />

      {/* 4. Page Footer Actions */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap justify-center gap-4">
        <Link href="/" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 transition-colors flex items-center gap-2">
          <span>🏠</span> กลับหน้าแดชบอร์ด
        </Link>
        <Link 
          href="#top"
          className="px-6 py-3 bg-white hover:bg-slate-50 text-teal-700 font-bold rounded-xl shadow-sm border border-teal-200 transition-colors flex items-center gap-2"
        >
          <span>🔄</span> ค้นหารถคันอื่น
        </Link>
        <Link href="/reports" className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
          <span>📊</span> ดูรายงานสรุปทั้งหมด
        </Link>
      </div>
    </>
  );
}
