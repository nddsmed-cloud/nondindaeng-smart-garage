import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import FuelLogsTable from "./FuelLogsTable";

export default async function EnergyPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  let whereClause: any = {};
  if (role === "DRIVER") {
    whereClause.userId = userId;
  } else if (role !== "ADMIN") {
    whereClause.department = session?.user?.department;
  }

  const logs = await prisma.fuelLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { vehicle: true },
  });

  const totalCost = logs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">บันทึกการเติมน้ำมัน</h1>
          {role !== "DRIVER" && (
            <p className="page-subtitle">
              รวม <strong style={{ color: "var(--yellow)" }}>{totalLiters.toLocaleString()}</strong> ลิตร &nbsp;·&nbsp;
              ค่าใช้จ่าย <strong style={{ color: "var(--red)" }}>{totalCost.toLocaleString("th-TH", { maximumFractionDigits: 0 })}</strong> บาท
            </p>
          )}
        </div>
        <Link href="/logs/energy/new" className="btn btn-primary">
          + บันทึกการเติมน้ำมัน
        </Link>
      </div>

      {/* Summary Stats (Hide for DRIVER) */}
      {role !== "DRIVER" && (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon yellow">⛽</div>
            <div>
              <div className="stat-label">ปริมาณน้ำมันรวม</div>
              <div className="stat-value">{totalLiters.toLocaleString("th-TH", { maximumFractionDigits: 1 })}</div>
              <div className="stat-sub">ลิตร</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">💰</div>
            <div>
              <div className="stat-label">ค่าน้ำมันรวม</div>
              <div className="stat-value">{totalCost.toLocaleString("th-TH", { maximumFractionDigits: 0 })}</div>
              <div className="stat-sub">บาท</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div>
              <div className="stat-label">จำนวนครั้งเติม</div>
              <div className="stat-value">{logs.length}</div>
              <div className="stat-sub">รายการ</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">📊</div>
            <div>
              <div className="stat-label">ราคาเฉลี่ย/ลิตร</div>
              <div className="stat-value">{logs.length > 0 ? (totalCost / totalLiters).toFixed(2) : "0"}</div>
              <div className="stat-sub">บาท</div>
            </div>
          </div>
        </div>
      )}

      <FuelLogsTable logs={logs} role={role || "DRIVER"} />
    </>
  );
}
