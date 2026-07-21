import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { auth } from "../../auth";
import { getAdminClient } from "../../lib/supabase";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const department = session?.user?.department;

  // คัดกรองข้อมูลตามหน่วยงาน (ยกเว้น ADMIN)
  const whereClause = role === "ADMIN" ? {} : { department };

  // ดึงข้อมูล Prisma (ยานพาหนะ + GIS)
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

  // ดึงข้อมูล e-Office จาก Supabase (permits + complaints)
  let pendingPermits = 0;
  let pendingComplaints = 0;
  let recentPermits: Record<string, unknown>[] = [];
  let recentComplaints: Record<string, unknown>[] = [];

  try {
    const supabase = getAdminClient();
    const [permitsRes, complaintsRes, recentPermitsRes, recentComplaintsRes] = await Promise.all([
      supabase.from("building_permits").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("citizen_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("building_permits").select("permit_number,applicant_name,building_type,status,created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("citizen_reports").select("tracking_number,problem_type,contact_name,status,created_at").order("created_at", { ascending: false }).limit(3),
    ]);
    pendingPermits = permitsRes.count ?? 0;
    pendingComplaints = complaintsRes.count ?? 0;
    recentPermits = (recentPermitsRes.data ?? []) as Record<string, unknown>[];
    recentComplaints = (recentComplaintsRes.data ?? []) as Record<string, unknown>[];
  } catch {
    // Supabase ไม่พร้อม — แสดง 0
  }

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

  const permitStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-yellow",
      inprogress: "badge-blue",
      waiting_docs: "badge-purple",
      approved: "badge-green",
      rejected: "badge-red",
    };
    return map[status] || "badge-blue";
  };

  const permitStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "รออนุมัติ",
      inprogress: "กำลังตรวจสอบ",
      waiting_docs: "รอเอกสาร",
      approved: "อนุมัติแล้ว",
      rejected: "ไม่อนุมัติ",
    };
    return map[status] || status;
  };

  const complaintStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-yellow",
      inprogress: "badge-blue",
      completed: "badge-green",
      rejected: "badge-red",
    };
    return map[status] || "badge-blue";
  };

  const complaintStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "รอดำเนินการ",
      inprogress: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      rejected: "ปฏิเสธ",
    };
    return map[status] || status;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            🏛️ ศูนย์ปฏิบัติการ e-Office กองช่าง
            {role !== "ADMIN" && department ? ` — ${department}` : ""}
          </h1>
          <p className="page-subtitle">ระบบบริหารจัดการ ยานพาหนะ · GIS · ใบอนุญาต · เรื่องร้องเรียน</p>
        </div>
      </div>

      {/* ─── Section: ยานพาหนะ ─── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
        🚗 ยานพาหนะ
      </div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
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
            <div className="stat-label">รออนุมัติใช้รถ</div>
            <div className="stat-value">{pendingRequests}</div>
            <div className="stat-sub">คำขอ</div>
          </div>
        </Link>
        <Link href="/logs" className="stat-card">
          <div className="stat-icon purple">🗺</div>
          <div>
            <div className="stat-label">บันทึกการเดินทาง</div>
            <div className="stat-value">{tripLogs}</div>
            <div className="stat-sub">รายการทั้งหมด</div>
          </div>
        </Link>
        <Link href="/logs/energy" className="stat-card">
          <div className="stat-icon red">⛽</div>
          <div>
            <div className="stat-label">ค่าน้ำมันรวม</div>
            <div className="stat-value">{totalFuelCost.toLocaleString("th-TH", { maximumFractionDigits: 0 })}</div>
            <div className="stat-sub">บาท</div>
          </div>
        </Link>
      </div>

      {/* ─── Section: GIS กองช่าง ─── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
        🗺️ GIS กองช่าง
      </div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
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

      {/* ─── Section: e-Office ─── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
        📋 e-Office (ประชาชน)
      </div>
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <Link href="/dashboard/permits" className="stat-card">
          <div className="stat-icon yellow">🏗️</div>
          <div>
            <div className="stat-label">ใบอนุญาตก่อสร้าง</div>
            <div className="stat-value">{pendingPermits}</div>
            <div className="stat-sub" style={{ color: pendingPermits > 0 ? "var(--yellow)" : undefined }}>
              {pendingPermits > 0 ? "⚠️ รอดำเนินการ" : "รออนุมัติ"}
            </div>
          </div>
        </Link>
        <Link href="/dashboard/complaints" className="stat-card">
          <div className="stat-icon blue">📣</div>
          <div>
            <div className="stat-label">เรื่องร้องเรียน</div>
            <div className="stat-value">{pendingComplaints}</div>
            <div className="stat-sub" style={{ color: pendingComplaints > 0 ? "var(--yellow)" : undefined }}>
              {pendingComplaints > 0 ? "⚠️ รอดำเนินการ" : "รอดำเนินการ"}
            </div>
          </div>
        </Link>
        <Link href="/saraban" className="stat-card">
          <div className="stat-icon purple">📬</div>
          <div>
            <div className="stat-label">สารบรรณ</div>
            <div className="stat-value">—</div>
            <div className="stat-sub">ทะเบียนหนังสือรับ-ส่ง</div>
          </div>
        </Link>
      </div>

      {/* ─── Bottom: Tables ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* การเดินทางล่าสุด */}
        <div>
          <div className="card-header" style={{ marginBottom: 10 }}>
            <h2 className="card-title" style={{ fontSize: 14 }}>🗺 การเดินทางล่าสุด</h2>
            <Link href="/logs" className="btn btn-ghost btn-sm">ดูทั้งหมด →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>คนขับ / รถ</th><th>ปลายทาง</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {recentTrips.length === 0 ? (
                  <tr><td colSpan={3} className="table-empty">ยังไม่มีบันทึก</td></tr>
                ) : recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <div className="td-primary">{trip.driverName}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {trip.vehicle?.licensePlate || "?"} {trip.vehicle?.brand || "?"}
                      </div>
                    </td>
                    <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
                      {trip.destination}
                    </td>
                    <td><span className={`badge ${statusBadge(trip.status)}`} style={{ fontSize: 10 }}>{trip.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ใบอนุญาตก่อสร้างล่าสุด */}
        <div>
          <div className="card-header" style={{ marginBottom: 10 }}>
            <h2 className="card-title" style={{ fontSize: 14 }}>🏗️ ใบอนุญาตล่าสุด</h2>
            <Link href="/dashboard/permits" className="btn btn-ghost btn-sm">ดูทั้งหมด →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>เลขคำขอ</th><th>ผู้ขอ</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {recentPermits.length === 0 ? (
                  <tr><td colSpan={3} className="table-empty">ยังไม่มีข้อมูล</td></tr>
                ) : recentPermits.map((p) => (
                  <tr key={p.id as string}>
                    <td style={{ fontSize: 11, fontFamily: "monospace" }}>{p.permit_number as string}</td>
                    <td style={{ fontSize: 12 }}>{p.applicant_name as string}</td>
                    <td>
                      <span className={`badge ${permitStatusBadge(p.status as string)}`} style={{ fontSize: 10 }}>
                        {permitStatusLabel(p.status as string)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* เรื่องร้องเรียนล่าสุด */}
        <div>
          <div className="card-header" style={{ marginBottom: 10 }}>
            <h2 className="card-title" style={{ fontSize: 14 }}>📣 ร้องเรียนล่าสุด</h2>
            <Link href="/dashboard/complaints" className="btn btn-ghost btn-sm">ดูทั้งหมด →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>เลขติดตาม</th><th>ประเภท</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {recentComplaints.length === 0 ? (
                  <tr><td colSpan={3} className="table-empty">ยังไม่มีข้อมูล</td></tr>
                ) : recentComplaints.map((r) => (
                  <tr key={r.id as string}>
                    <td style={{ fontSize: 11, fontFamily: "monospace" }}>{r.tracking_number as string}</td>
                    <td style={{ fontSize: 12 }}>{r.problem_type as string}</td>
                    <td>
                      <span className={`badge ${complaintStatusBadge(r.status as string)}`} style={{ fontSize: 10 }}>
                        {complaintStatusLabel(r.status as string)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
