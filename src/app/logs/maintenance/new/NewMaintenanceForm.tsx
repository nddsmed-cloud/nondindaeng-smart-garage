"use client";

import { useState } from "react";
import { createMaintenanceLog } from "../actions";
import Link from "next/link";

type Vehicle = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
};

export default function NewMaintenanceForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await createMaintenanceLog(formData);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">บันทึกการซ่อมบำรุง (แบบ ๖)</h1>
          <p className="page-subtitle">เพิ่มประวัติการซ่อมบำรุงรถยนต์</p>
        </div>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>รถยนต์ที่ซ่อมบำรุง</label>
            <select name="vehicleId" required className="form-control">
              <option value="">-- เลือกรถยนต์ --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} ({v.brand} {v.model})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>วันที่ซ่อมบำรุง</label>
            <input type="date" name="maintenanceDate" required className="form-control" defaultValue={new Date().toISOString().split("T")[0]} />
          </div>

          <div className="form-group">
            <label>เลขไมล์ (กม.)</label>
            <input type="number" name="mileage" required min="0" className="form-control" placeholder="เช่น 45000" />
            <span className="form-help">เลขไมล์รถขณะที่นำเข้าอู่ซ่อม</span>
          </div>

          <div className="form-group">
            <label>ค่าใช้จ่าย (บาท)</label>
            <input type="number" name="cost" required min="0" step="0.01" className="form-control" placeholder="เช่น 1500.50" />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>รายการที่ซ่อมบำรุง</label>
            <textarea name="details" required className="form-control" rows={3} placeholder="เช่น ถ่ายน้ำมันเครื่อง, เปลี่ยนยาง 4 เส้น, ซ่อมแอร์"></textarea>
          </div>

          <div className="form-group">
            <label>ชื่ออู่ / ศูนย์บริการ</label>
            <input type="text" name="garageName" required className="form-control" placeholder="ระบุชื่ออู่ หรือ ร้านซ่อม" />
          </div>

          <div className="form-group">
            <label>ชื่อผู้รับผิดชอบ / ผู้คุมรถ</label>
            <input type="text" name="responsibleName" className="form-control" placeholder="(เว้นว่างไว้เพื่อใช้ชื่อคุณอัตโนมัติ)" />
          </div>

          <div className="form-actions" style={{ gridColumn: "1 / -1", marginTop: 20 }}>
            <Link href="/logs/maintenance" className="btn btn-secondary">ยกเลิก</Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "กำลังบันทึก..." : "บันทึกประวัติการซ่อม"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
