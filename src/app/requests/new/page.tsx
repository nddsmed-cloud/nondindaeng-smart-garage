"use client";

import { useState, useEffect } from "react";
import { createRequest, getVehiclesByDepartment } from "../actions";
import Link from "next/link";

const departments = [
  "สำนักปลัด", "กองคลัง", "กองช่าง", "กองการศึกษา",
  "กองสาธารณสุข", "กองสวัสดิการสังคม",
];

export default function NewRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [startMileage, setStartMileage] = useState<number | string>("");
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadVehicles() {
      setIsLoadingVehicles(true);
      try {
        const list = await getVehiclesByDepartment(selectedDept);
        if (active) {
          setAvailableVehicles(list);
          if (list.length > 0) {
            setSelectedVehicleId(list[0].id);
            setStartMileage(list[0].latestMileage);
          } else {
            setSelectedVehicleId("");
            setStartMileage("");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoadingVehicles(false);
      }
    }
    loadVehicles();
    return () => { active = false; };
  }, [selectedDept]);

  const handleVehicleChange = (vid: string) => {
    setSelectedVehicleId(vid);
    const vehicle = availableVehicles.find(v => v.id === vid);
    if (vehicle) {
      setStartMileage(vehicle.latestMileage);
    } else {
      setStartMileage("");
    }
  };

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
                <select 
                  name="department" 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="form-select"
                >
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
                <label className="form-label">รถยนต์ที่ต้องการใช้ *</label>
                <select 
                  name="vehicleId" 
                  className="form-select" 
                  required
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                >
                  {isLoadingVehicles ? (
                    <option value="">⏳ กำลังโหลดข้อมูลรถ...</option>
                  ) : availableVehicles.length === 0 ? (
                    <option value="">❌ ไม่มีรถลงทะเบียนในสังกัดนี้</option>
                  ) : (
                    availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} — {v.brand} {v.model} ({v.vehicleType})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">เลขไมล์เริ่มต้นสะสม (กม.) *</label>
                <input 
                  type="number" 
                  name="startMileage" 
                  required 
                  value={startMileage} 
                  onChange={(e) => setStartMileage(e.target.value)} 
                  className="form-input" 
                  placeholder="ตัวเลขไมล์สะสม"
                />
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
