"use client";

import { useState } from "react";
import { deleteTripLog } from "./actions";

type TripLog = {
  id: string;
  driverName: string;
  department: string;
  destination: string;
  purpose: string;
  travelDate: string;
  startMileage: number;
  endMileage: number;
  distance: number;
  status: string;
  vehicle: { licensePlate: string; brand: string; model: string };
};

export default function TripLogsTable({ trips, role }: { trips: TripLog[], role: string }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = trips.filter((t) =>
    [t.driverName, t.department, t.destination, t.vehicle.licensePlate, t.status]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      "กำลังเดินทาง": "badge-blue",
      "เสร็จสิ้น": "badge-green",
    };
    return map[status] || "badge-yellow";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบบันทึกนี้?")) return;
    setLoadingId(id);
    await deleteTripLog(id);
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
            placeholder="ค้นหาคนขับ, ปลายทาง, ทะเบียน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{filtered.length} / {trips.length} รายการ</div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>คนขับ / แผนก</th>
              <th>รถยนต์</th>
              <th>วันที่เดินทาง</th>
              <th>ปลายทาง</th>
              <th>เลขไมล์เริ่ม</th>
              <th>เลขไมล์สิ้นสุด</th>
              <th>ระยะทาง (กม.)</th>
              <th>สถานะ</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🗺</div>
                    <div>{search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีบันทึกการเดินทาง"}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <div className="td-primary">{trip.driverName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{trip.department}</div>
                  </td>
                  <td>
                    <div className="td-primary">{trip.vehicle.licensePlate}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{trip.vehicle.brand} {trip.vehicle.model}</div>
                  </td>
                  <td>{trip.travelDate}</td>
                  <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trip.destination}</td>
                  <td>{trip.startMileage.toLocaleString()}</td>
                  <td>{trip.endMileage > 0 ? trip.endMileage.toLocaleString() : "—"}</td>
                  <td>{trip.distance > 0 ? trip.distance.toLocaleString() : "—"}</td>
                  <td><span className={`badge ${statusBadge(trip.status)}`}>{trip.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    {role !== "DRIVER" && (
                      <button
                        onClick={() => handleDelete(trip.id)}
                        disabled={loadingId === trip.id}
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
