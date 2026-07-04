"use client";

import { useState } from "react";
import { deleteFuelLog } from "../actions";
import { formatThaiDate } from "../../../lib/date-formatter";

type FuelLog = {
  id: string;
  fuelDate: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  startMileage: number;
  endMileage: number;
  distance: number;
  standardRate: number;
  expectedFuel: number;
  fuelDifference: number;
  explanation: string;
  fuelStation: string;
  note: string;
  status: string;
  department?: string | null;
  vehicle: { licensePlate: string; brand: string; model: string };
};

export default function FuelLogsTable({ logs, role }: { logs: FuelLog[], role: string }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = logs.filter((l) =>
    [l.vehicle.licensePlate, l.vehicle.brand, l.fuelStation, l.fuelDate]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบบันทึกนี้?")) return;
    setLoadingId(id);
    await deleteFuelLog(id);
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
            placeholder="ค้นหาทะเบียน, วันที่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{filtered.length} / {logs.length} รายการ</div>
      </div>

      <div className="table-wrapper" style={{ overflowX: "auto" }}>
        <table style={{ minWidth: "1200px" }}>
          <thead>
            <tr>
              <th>รถยนต์ / กอง</th>
              <th>วันที่</th>
              <th style={{ textAlign: "center" }}>ไมล์เริ่ม<br/><span style={{fontSize: 10, fontWeight: "normal"}}>เลขไมล์สิ้นสุด</span></th>
              <th style={{ textAlign: "center" }}>ระยะทาง<br/><span style={{fontSize: 10, fontWeight: "normal"}}>[A]</span></th>
              <th style={{ textAlign: "center" }}>เติมจริง<br/><span style={{fontSize: 10, fontWeight: "normal"}}>[B]</span></th>
              <th style={{ textAlign: "center" }}>เกณฑ์<br/><span style={{fontSize: 10, fontWeight: "normal"}}>[C]</span></th>
              <th style={{ textAlign: "center" }}>ควรใช้<br/><span style={{fontSize: 10, fontWeight: "normal"}}>[D=A/C]</span></th>
              <th style={{ textAlign: "center" }}>ส่วนต่าง<br/><span style={{fontSize: 10, fontWeight: "normal"}}>[E=B-D]</span></th>
              <th>หมายเหตุ / ชี้แจง</th>
              <th style={{ textAlign: "center" }}>สถานะ</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="table-empty">
                    <div className="table-empty-icon">⛽</div>
                    <div>{search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีบันทึกการเติมน้ำมัน"}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((log) => {
                const diffColor = log.fuelDifference > 0 ? "var(--red)" : "var(--green)";
                const diffSign = log.fuelDifference > 0 ? "+" : "";
                return (
                  <tr key={log.id}>
                    <td>
                      <div className="td-primary">{log.vehicle.licensePlate}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {log.vehicle.brand} {log.department ? `(${log.department})` : ""}
                      </div>
                    </td>
                    <td>{formatThaiDate(log.fuelDate)}</td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>{log.startMileage.toLocaleString()}</div>
                      <div>{log.endMileage.toLocaleString()}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>{log.distance.toLocaleString()}</td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{log.liters.toFixed(2)}</td>
                    <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{log.standardRate.toFixed(2)}</td>
                    <td style={{ textAlign: "center" }}>{log.expectedFuel.toFixed(2)}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold", color: diffColor }}>
                      {diffSign}{log.fuelDifference.toFixed(2)}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{log.explanation || log.note || "ปกติ"}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge ${
                        log.status === "รออนุมัติ" ? "badge-yellow" :
                        log.status === "อนุมัติแล้ว" ? "badge-green" :
                        "badge-red"
                      }`}>
                        {log.status}
                      </span>
                    </td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
