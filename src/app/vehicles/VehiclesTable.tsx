"use client";

import { useState } from "react";
import { deleteVehicle } from "./vehicle-actions";

type Vehicle = {
  id: string;
  licensePlate: string;
  province: string;
  vehicleType: string;
  bodyType: string;
  brand: string;
  model: string;
  color: string;
  fuelType: string;
  status: string;
};

export default function VehiclesTable({ vehicles, role }: { vehicles: Vehicle[], role: string }) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = vehicles.filter((v) =>
    [v.licensePlate, v.brand, v.model, v.vehicleType, v.status]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      "พร้อมใช้งาน": "badge-green",
      "ส่งซ่อม": "badge-yellow",
      "ยกเลิกใช้งาน": "badge-red",
    };
    return map[status] || "badge-blue";
  };

  const handleDelete = async (id: string, plate: string) => {
    if (!confirm(`ยืนยันการลบรถทะเบียน "${plate}" ออกจากระบบ?`)) return;
    setDeletingId(id);
    await deleteVehicle(id);
    setDeletingId(null);
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาทะเบียน, ยี่ห้อ, ประเภทรถ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
          {filtered.length} / {vehicles.length} รายการ
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>เลขทะเบียน</th>
              <th>ยี่ห้อ / รุ่น</th>
              <th>ประเภทรถ</th>
              <th>สี</th>
              <th>เชื้อเพลิง</th>
              <th>สถานะ</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🚗</div>
                    <div>{search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีข้อมูลรถยนต์"}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="td-primary">{vehicle.licensePlate}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{vehicle.province}</div>
                  </td>
                  <td>
                    <div className="td-primary">{vehicle.brand}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{vehicle.model}</div>
                  </td>
                  <td>
                    <div>{vehicle.vehicleType}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{vehicle.bodyType}</div>
                  </td>
                  <td>{vehicle.color}</td>
                  <td>{vehicle.fuelType}</td>
                  <td>
                    <span className={`badge ${statusBadge(vehicle.status)}`}>{vehicle.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {role === "ADMIN" && (
                        <>
                          <a href={`/vehicles/${vehicle.id}/edit`} className="btn btn-warning btn-sm">✏️ แก้ไข</a>
                          <button
                            onClick={() => handleDelete(vehicle.id, vehicle.licensePlate)}
                            disabled={deletingId === vehicle.id}
                            className="btn btn-danger btn-sm"
                          >
                            {deletingId === vehicle.id ? "⏳" : "🗑 ลบ"}
                          </button>
                        </>
                      )}
                    </div>
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
