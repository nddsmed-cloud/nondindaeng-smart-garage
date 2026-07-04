"use client";

import { useState, useEffect } from "react";
import { createTripLog, getLatestMileage } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Vehicle = { id: string; licensePlate: string; brand: string; model: string; status: string };

const departments = [
  "สำนักปลัด", "กองคลัง", "กองช่าง", "กองการศึกษา",
  "กองสาธารณสุข", "กองสวัสดิการสังคม",
];

export default function NewTripLogPage({ 
  vehicles,
  roads,
  searchParams
}: { 
  vehicles: Vehicle[],
  roads: { id: string; name: string }[],
  searchParams?: { [key: string]: string | undefined }
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiff, setIsLiff] = useState(false);
  const [lockedDate, setLockedDate] = useState("");
  
  // Controlled form states pre-filled from searchParams
  const [selectedVehicleId, setSelectedVehicleId] = useState(searchParams?.vehicleId || "");
  const [driverName, setDriverName] = useState(searchParams?.driver || "");
  const [selectedDept, setSelectedDept] = useState(searchParams?.dept || "");
  const [destination, setDestination] = useState(searchParams?.dest || "");
  const [purpose, setPurpose] = useState(searchParams?.purpose || "");
  const [startMileage, setStartMileage] = useState<number | string>(searchParams?.startMileage || "");
  
  const router = useRouter();
 
  useEffect(() => {
    // 1. Initialize LIFF check
    const checkLiff = async () => {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || "" });
        if (liff.isInClient()) {
          setIsLiff(true);
        }
      } catch (err) {
        console.error("LIFF init error", err);
      }
    };
    checkLiff();
 
    // 2. Lock current date to Server/Device Time (Anti-fraud for OAG)
    const today = new Date();
    // Offset for local timezone correctly
    const localDateString = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
      .toISOString().split("T")[0];
    setLockedDate(localDateString);
  }, []);
 
  const ready = vehicles.filter((v) => v.status === "พร้อมใช้งาน");
 
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await createTripLog(formData);
      if (res?.success && isLiff) {
        const liff = (await import("@line/liff")).default;
        liff.closeWindow();
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };
 
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">บันทึกการเดินทาง</h1>
          <p className="page-subtitle">กรอกรายละเอียดการเดินทางของรถยนต์</p>
        </div>
        <Link href="/logs" className="btn btn-ghost">← กลับ</Link>
      </div>
 
      <div className="card">
        <form action={handleSubmit}>
          {/* Hidden flag to tell Server Action not to redirect if in LIFF */}
          <input type="hidden" name="isLiff" value={isLiff ? "true" : "false"} />
          <input type="hidden" name="requestId" value={searchParams?.requestId || ""} />
 
          <div className="form-section">
            <div className="form-section-title">ข้อมูลรถและคนขับ</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">รถยนต์ *</label>
                <select 
                  name="vehicleId" 
                  required 
                  className="form-select"
                  value={selectedVehicleId}
                  onChange={async (e) => {
                    const vid = e.target.value;
                    setSelectedVehicleId(vid);
                    if (vid) {
                      const latest = await getLatestMileage(vid);
                      setStartMileage(latest);
                    } else {
                      setStartMileage("");
                    }
                  }}
                >
                  <option value="">-- เลือกรถยนต์ --</option>
                  {ready.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} — {v.brand} {v.model}
                    </option>
                  ))}
                </select>
                {ready.length === 0 && (
                  <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>
                    ⚠️ ไม่มีรถที่พร้อมใช้งาน กรุณาตรวจสอบสถานะรถ
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">ชื่อคนขับ *</label>
                <input 
                  type="text" 
                  name="driverName" 
                  required 
                  placeholder="ระบุชื่อ-สกุลคนขับ" 
                  className="form-input" 
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">สังกัด *</label>
                <select 
                  name="department" 
                  className="form-select"
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                >
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">วันที่เดินทาง (ล็อกค่าอัตโนมัติ) *</label>
                <input 
                  type="date" 
                  name="travelDate" 
                  required 
                  value={lockedDate}
                  readOnly
                  className="form-input bg-slate-100 text-slate-500 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
 
          <div className="form-section">
            <div className="form-section-title">รายละเอียดการเดินทาง</div>
            <div className="form-grid">
              <div className="form-group span-2">
                <label className="form-label">ปลายทาง *</label>
                <input 
                  type="text" 
                  name="destination" 
                  required 
                  placeholder="เช่น ที่ว่าการอำเภอ หรือ ชื่อหมู่บ้าน" 
                  className="form-input" 
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </div>
              <div className="form-group span-2">
                <label className="form-label">ถนนที่เกี่ยวข้อง (GIS) <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(ไม่บังคับ)</span></label>
                <select name="roadId" className="form-select">
                  <option value="">-- ไม่ระบุถนน --</option>
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  เลือกถนนกรณีที่เดินทางไปปฏิบัติงานซ่อมบำรุงหรือตรวจสอบถนนสายนั้นๆ
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">เลขไมล์ตอนออก *</label>
                <input 
                  type="number" 
                  name="startMileage" 
                  required 
                  min={0} 
                  placeholder="เช่น 45000" 
                  className="form-input" 
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                />
              </div>
              <div className="form-group span-2">
                <label className="form-label">วัตถุประสงค์ *</label>
                <textarea 
                  name="purpose" 
                  required 
                  rows={3} 
                  placeholder="ระบุวัตถุประสงค์การเดินทาง..." 
                  className="form-textarea" 
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            {isLiff ? (
              <button type="button" onClick={async () => {
                const liff = (await import("@line/liff")).default;
                liff.closeWindow();
              }} className="btn btn-ghost">ปิดหน้าต่าง</button>
            ) : (
              <Link href="/logs" className="btn btn-ghost">ยกเลิก</Link>
            )}
            <button type="submit" disabled={isSubmitting || !lockedDate} className="btn btn-primary">
              {isSubmitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกการเดินทาง"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
