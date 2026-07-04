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
import { getBangkokDateString } from "../../../../lib/date-formatter";
import ThaiDateInput from "../../../../components/ui/ThaiDateInput";

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
          <h1 className="page-title text-2xl font-bold text-teal-800 flex items-center gap-2">
            <span>🔧</span> บันทึกการซ่อมบำรุง (แบบ ๖)
          </h1>
          <p className="page-subtitle text-slate-500 mt-1">เพิ่มประวัติการซ่อมบำรุงรักษา พัสดุ และอะไหล่ยานพาหนะ</p>
        </div>
      </div>

      <div className="card max-w-4xl">
        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title flex items-center gap-2">
              <span className="text-base">📋</span> ข้อมูลการซ่อมบำรุง
            </h3>
            <div className="form-grid">
              <div className="form-group span-2">
                <label className="form-label">รถยนต์ที่ซ่อมบำรุง</label>
                <select name="vehicleId" required className="form-select">
                  <option value="">-- เลือกรถยนต์ --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} ({v.brand} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">วันที่ซ่อมบำรุง</label>
                <ThaiDateInput name="maintenanceDate" required className="form-input" defaultValue={getBangkokDateString()} />
              </div>

              <div className="form-group">
                <label className="form-label">เลขไมล์ (กม.)</label>
                <input type="number" name="mileage" required min="0" className="form-input" placeholder="เช่น 45000" />
                <span className="text-xs text-slate-400 font-medium">เลขไมล์รถขณะที่นำเข้าอู่ซ่อม</span>
              </div>

              <div className="form-group span-2">
                <label className="form-label">รายการที่ซ่อมบำรุง</label>
                <textarea name="details" required className="form-textarea" rows={3} placeholder="เช่น ถ่ายน้ำมันเครื่อง, เปลี่ยนยาง 4 เส้น, ซ่อมแอร์"></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">ค่าใช้จ่าย (บาท)</label>
                <div className="relative">
                  <input type="number" name="cost" required min="0" step="0.01" className="form-input w-full pr-12" placeholder="เช่น 1500.50" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">THB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section mt-8">
            <h3 className="form-section-title flex items-center gap-2">
              <span className="text-base">🏢</span> ข้อมูลสถานที่และผู้รับผิดชอบ
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ชื่ออู่ / ศูนย์บริการ</label>
                <input type="text" name="garageName" required className="form-input" placeholder="ระบุชื่ออู่ หรือ ร้านซ่อม" />
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อผู้รับผิดชอบ / ผู้คุมรถ</label>
                <input type="text" name="responsibleName" className="form-input" placeholder="(เว้นว่างไว้เพื่อใช้ชื่อคุณอัตโนมัติ)" />
              </div>
            </div>
          </div>

          <div className="form-actions mt-6">
            <Link href="/logs/maintenance" className="btn btn-ghost">ยกเลิก</Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                "บันทึกประวัติการซ่อม"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
