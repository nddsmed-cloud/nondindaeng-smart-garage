"use client";

import { useState } from "react";
import { createRequest } from "../actions";
import Link from "next/link";

const departments = [
  "สำนักปลัด", "กองคลัง", "กองช่าง", "กองการศึกษา",
  "กองสาธารณสุข", "กองสวัสดิการสังคม",
];

const vehicleTypes = ["รถกระบะ", "รถตู้", "รถเก๋ง", "รถบรรทุกน้ำ", "รถบรรทุก"];

export default function NewRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">สร้างคำขออนุญาตใช้รถ</h1>
          <p className="page-subtitle">กรอกรายละเอียดการขออนุญาตใช้รถยนต์ส่วนกลาง</p>
        </div>
        <Link href="/requests" className="btn btn-ghost">← กลับ</Link>
      </div>

      <div className="card">
        <form action={async (f) => { setIsSubmitting(true); await createRequest(f); }}>

          <div className="form-section">
            <div className="form-section-title">ข้อมูลผู้ขอ</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ชื่อ-สกุล ผู้ขอ *</label>
                <input type="text" name="requesterName" required placeholder="ระบุชื่อ-สกุล" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">สังกัด (กอง/สำนัก) *</label>
                <select name="department" className="form-select">
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">รายละเอียดการเดินทาง</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ประเภทรถที่ต้องการ *</label>
                <select name="vehicleType" className="form-select">
                  {vehicleTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">วันที่เดินทาง *</label>
                <input type="date" name="travelDate" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ปลายทาง *</label>
                <input type="text" name="destination" required placeholder="เช่น อำเภอเมือง จังหวัดเชียงใหม่" className="form-input" />
              </div>
              <div className="form-group span-2">
                <label className="form-label">วัตถุประสงค์การเดินทาง *</label>
                <textarea name="purpose" required rows={3} placeholder="ระบุวัตถุประสงค์..." className="form-textarea" />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link href="/requests" className="btn btn-ghost">ยกเลิก</Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "⏳ กำลังส่งคำขอ..." : "📤 ส่งคำขออนุญาต"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
