"use client";

import { useState } from "react";
import { deleteMaintenanceLog } from "./actions";

type MaintenanceLog = {
  id: string;
  maintenanceDate: string;
  mileage: number;
  details: string;
  cost: number;
  garageName: string;
  responsibleName: string;
  department: string;
  vehicle: { licensePlate: string; brand: string; model: string };
};

export default function MaintenanceTable({ logs, role }: { logs: MaintenanceLog[], role: string }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = logs.filter((log) =>
    [log.vehicle.licensePlate, log.details, log.garageName, log.department]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบประวัติการซ่อมบำรุงนี้?")) return;
    setLoadingId(id);
    await deleteMaintenanceLog(id);
    setLoadingId(null);
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาทะเบียนรถ, รายการซ่อม, ชื่ออู่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{filtered.length} / {logs.length} รายการ</div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>วันที่ซ่อม</th>
              <th>รถยนต์</th>
              <th>เลขไมล์ (กม.)</th>
              <th>รายการซ่อมบำรุง</th>
              <th>ชื่ออู่/ศูนย์บริการ</th>
              <th>ค่าใช้จ่าย (บาท)</th>
              <th>ผู้ควบคุมดูแล</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🔧</div>
                    <div>{search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีประวัติการซ่อมบำรุง"}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  <td>{log.maintenanceDate}</td>
                  <td>
                    <div className="td-primary">{log.vehicle.licensePlate}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{log.department}</div>
                  </td>
                  <td>{log.mileage.toLocaleString()}</td>
                  <td style={{ maxWidth: 200, whiteSpace: "normal" }}>{log.details}</td>
                  <td>{log.garageName}</td>
                  <td style={{ color: "var(--red)", fontWeight: 500 }}>
                    {log.cost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                  <td>{log.responsibleName}</td>
                  <td style={{ textAlign: "right" }}>
                    {role !== "DRIVER" && (
                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={loadingId === log.id}
                        className="btn btn-danger btn-sm"
                      >
                        🗑 ลบ
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
