import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { auth } from "../../auth";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  // คัดกรองข้อมูลตามหน่วยงาน (ยกเว้น ADMIN)
  const whereClause = role === "ADMIN" ? {} : { department };

  const [
    totalVehicles,
    readyVehicles,
    pendingRequests,
    tripLogs,
    fuelLogs,
    recentTrips,
    totalRoads,
    damagedFixtures,
  ] = await Promise.all([
    prisma.vehicle.count({ where: whereClause }),
    prisma.vehicle.count({ where: { status: "พร้อมใช้งาน", ...whereClause } }),
    prisma.vehicleRequest.count({ where: { status: "รออนุมัติ", ...whereClause } }),
    prisma.tripLog.count({ where: whereClause }),
    prisma.fuelLog.findMany({ where: whereClause, select: { totalCost: true } }),
    prisma.tripLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vehicle: true },
    }),
    prisma.infraAsset.count(),
    prisma.roadFixture.count({ where: { status: "DAMAGED" } }),
  ]);

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      "รออนุมัติ": "badge-yellow",
      "อนุมัติแล้ว": "badge-green",
      "ไม่อนุมัติ": "badge-red",
      "พร้อมใช้งาน": "badge-green",
      "ส่งซ่อม": "badge-red",
      "ยกเลิกใช้งาน": "badge-purple",
      "กำลังเดินทาง": "badge-blue",
      "เสร็จสิ้น": "badge-green",
    };
    return map[status] || "badge-blue";
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">แดชบอร์ด {role !== "ADMIN" && department ? `- ${department}` : ""}</h1>
          <p className="page-subtitle">ภาพรวมระบบบริหารจัดการรถยนต์ส่วนกลาง</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card-dropdown-container">
          <div className="stat-card" style={{ cursor: "pointer" }}>
            <div className="stat-icon blue">🚗</div>
            <div>
              <div className="stat-label">รถยนต์ทั้งหมด</div>
              <div className="stat-value">{totalVehicles}</div>
              <div className="stat-sub" style={{ color: "var(--blue)", fontWeight: 600 }}>📂 แตะเพื่อเลือกเมนู</div>
            </div>
          </div>
          <div className="stat-card-dropdown-menu">
            <Link href="/vehicles" className="stat-card-dropdown-item">📋 ทะเบียนรถยนต์</Link>
            {(role === "ADMIN" || role === "MANAGER" || role === "OFFICER") && (
              <>
                <Link href="/requests" className="stat-card-dropdown-item">📝 คำขอใช้รถยนต์</Link>
                <Link href="/requests/new" className="stat-card-dropdown-item">➕ สร้างคำขอใช้รถ</Link>
              </>
            )}
          </div>
        </div>
        <Link href="/vehicles" className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-label">รถพร้อมใช้งาน</div>
            <div className="stat-value">{readyVehicles}</div>
            <div className="stat-sub">จาก {totalVehicles} คัน</div>
          </div>
        </Link>
        <Link href="/dashboard/approvals" className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div>
            <div className="stat-label">รออนุมัติ</div>
            <div className="stat-value">{pendingRequests}</div>
            <div className="stat-sub">คำขอ</div>
          </div>
        </Link>
        <Link href="/logs/new" className="stat-card">
          <div className="stat-icon purple">🗺</div>
          <div>
            <div className="stat-label">บันทึกการเดินทาง</div>
            <div className="stat-value">{tripLogs}</div>
            <div className="stat-sub">รายการทั้งหมด</div>
          </div>
        </Link>
        <Link href="/logs/energy/new" className="stat-card">
          <div className="stat-icon red">⛽</div>
          <div>
            <div className="stat-label">ค่าน้ำมันรวม</div>
            <div className="stat-value">{totalFuelCost.toLocaleString("th-TH", { maximumFractionDigits: 0 })}</div>
            <div className="stat-sub">บาท</div>
          </div>
        </Link>
        <Link href="/gis/roads" className="stat-card">
          <div className="stat-icon blue">🛣️</div>
          <div>
            <div className="stat-label">ทะเบียนถนน ทถ.3</div>
            <div className="stat-value">{totalRoads}</div>
            <div className="stat-sub">สายทาง</div>
          </div>
        </Link>
        <Link href="/gis/map" className="stat-card">
          <div className="stat-icon red">🚨</div>
          <div>
            <div className="stat-label">สิ่งติดตั้งชำรุด</div>
            <div className="stat-value">{damagedFixtures}</div>
            <div className="stat-sub">จุดที่ต้องตรวจสอบ</div>
          </div>
        </Link>
      </div>

      {/* Recent Trips (Full Width) */}
      <div style={{ marginTop: "28px" }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <h2 className="card-title">🗺 การเดินทางล่าสุด</h2>
          <Link href="/logs" className="btn btn-ghost btn-sm">ดูทั้งหมด →</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>คนขับ / รถ</th>
                <th>ปลายทาง</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length === 0 ? (
                <tr><td colSpan={3} className="table-empty">ยังไม่มีบันทึก</td></tr>
              ) : (
                recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <div className="td-primary">{trip.driverName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {trip.vehicle?.licensePlate || "?"} {trip.vehicle?.brand || "?"}
                      </div>
                    </td>
                    <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {trip.destination}
                    </td>
                    <td><span className={`badge ${statusBadge(trip.status)}`}>{trip.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
