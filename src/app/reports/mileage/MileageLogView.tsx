"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Vehicle = any; // We can type this properly later, it includes fuelLogs and tripLogs

export default function MileageLogView({ vehicles, role, department }: { vehicles: Vehicle[], role: string, department: string }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const logs = useMemo(() => {
    if (!selectedVehicle) return [];
    
    const combined = [];
    
    // Add Trip Logs
    for (const trip of selectedVehicle.tripLogs || []) {
      combined.push({
        id: trip.id,
        date: trip.travelDate,
        type: "TRIP",
        startMileage: trip.startMileage,
        endMileage: trip.endMileage,
        distance: trip.distance,
        detail: `ปลายทาง: ${trip.destination} (วัตถุประสงค์: ${trip.purpose})`,
        driver: trip.driverName,
        createdAt: new Date(trip.createdAt).getTime(),
      });
    }

    // Add Fuel Logs
    for (const fuel of selectedVehicle.fuelLogs || []) {
      combined.push({
        id: fuel.id,
        date: fuel.fuelDate,
        type: "FUEL",
        startMileage: fuel.startMileage,
        endMileage: fuel.endMileage,
        distance: fuel.distance,
        detail: `เติมน้ำมัน ${fuel.liters.toFixed(2)} ลิตร (ราคา ${(fuel.totalCost).toLocaleString()} บาท) สถานี: ${fuel.fuelStation}`,
        driver: "-", // Usually no specific driver tracked in fuel directly, or we can use the note
        createdAt: new Date(fuel.createdAt).getTime(),
      });
    }

    // Sort chronologically by date and then by creation time
    return combined.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.createdAt - b.createdAt;
    });
  }, [selectedVehicle]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">สมุดบันทึกประวัติการใช้รถและเลขไมล์</h1>
          <p className="page-subtitle">แสดงข้อมูลการเดินทางและการเติมน้ำมันเรียงตามวันที่ {role !== "ADMIN" && department ? `- ${department}` : ""}</p>
        </div>
        <Link href="/dashboard" className="btn btn-ghost">← กลับ</Link>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="form-group">
          <label className="form-label">เลือกรถยนต์</label>
          <select 
            className="form-select"
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
          >
            <option value="">-- กรุณาเลือกรถยนต์ --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.licensePlate} — {v.brand} {v.model} ({v.department || "ไม่มีสังกัด"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVehicle && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
            ประวัติการใช้รถ: {selectedVehicle.licensePlate}
          </h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>รายละเอียด</th>
                  <th>ผู้ขับขี่</th>
                  <th style={{ textAlign: "right" }}>เลขไมล์เริ่มต้น</th>
                  <th style={{ textAlign: "right" }}>เลขไมล์สิ้นสุด</th>
                  <th style={{ textAlign: "right" }}>ระยะทาง (กม.)</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>ไม่มีข้อมูลประวัติ</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={`${log.type}-${log.id}`}>
                      <td>{log.date}</td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: log.type === "TRIP" ? "var(--blue-50)" : "var(--green-50)",
                          color: log.type === "TRIP" ? "var(--blue-700)" : "var(--green-700)",
                        }}>
                          {log.type === "TRIP" ? "🚗 เดินทาง" : "⛽ เติมน้ำมัน"}
                        </span>
                      </td>
                      <td>{log.detail}</td>
                      <td>{log.driver}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>{log.startMileage.toLocaleString()}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>{log.endMileage.toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>{log.distance > 0 ? log.distance.toLocaleString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
