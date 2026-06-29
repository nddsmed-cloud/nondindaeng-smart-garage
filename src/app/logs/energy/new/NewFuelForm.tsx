"use client";

import { useState, useEffect } from "react";
import { createFuelLog } from "../../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Vehicle = { id: string; licensePlate: string; brand: string; model: string };

export default function NewFuelForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liters, setLiters] = useState("");
  const [price, setPrice] = useState("");
  const total = (parseFloat(liters) || 0) * (parseFloat(price) || 0);

  const [isLiff, setIsLiff] = useState(false);
  const [lockedDate, setLockedDate] = useState("");
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

    // 2. Lock current date to Server/Device Time
    const today = new Date();
    const localDateString = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
      .toISOString().split("T")[0];
    setLockedDate(localDateString);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await createFuelLog(formData);
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
          <h1 className="page-title">บันทึกการเติมน้ำมัน</h1>
          <p className="page-subtitle">กรอกรายละเอียดการเติมน้ำมันของรถยนต์</p>
        </div>
        <Link href="/logs/energy" className="btn btn-ghost">← กลับ</Link>
      </div>

      <div className="card">
        <form action={handleSubmit}>
          {/* Hidden flag to tell Server Action not to redirect if in LIFF */}
          <input type="hidden" name="isLiff" value={isLiff ? "true" : "false"} />

          <div className="form-section">
            <div className="form-section-title">ข้อมูลการเติมน้ำมัน</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">รถยนต์ *</label>
                <select name="vehicleId" required className="form-select">
                  <option value="">-- เลือกรถยนต์ --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} — {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">วันที่เติม (ล็อกค่าอัตโนมัติ) *</label>
                <input 
                  type="date" 
                  name="fuelDate" 
                  required 
                  value={lockedDate}
                  readOnly
                  className="form-input bg-slate-100 text-slate-500 cursor-not-allowed" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">สถานีน้ำมัน</label>
                <input type="text" name="fuelStation" placeholder="เช่น ปตท. สาขา..." className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">เลขไมล์ ณ วันเติม (สิ้นสุด) *</label>
                <input type="number" name="endMileage" required min={0} placeholder="เช่น 45000" className="form-input" />
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  ระบบจะดึงเลขไมล์ครั้งก่อนหน้ามาเป็น "เลขไมล์เริ่ม" ให้อัตโนมัติ
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">ข้อมูลน้ำมัน</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">จำนวนลิตร *</label>
                <input
                  type="number"
                  name="liters"
                  required
                  min={0}
                  step={0.01}
                  placeholder="เช่น 50.00"
                  className="form-input"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ราคา/ลิตร (บาท) *</label>
                <input
                  type="number"
                  name="pricePerLiter"
                  required
                  min={0}
                  step={0.01}
                  placeholder="เช่น 35.84"
                  className="form-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              {/* Total Cost Preview */}
              <div className="form-group">
                <label className="form-label">ราคารวม (คำนวณอัตโนมัติ)</label>
                <div style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "9px 12px",
                  color: total > 0 ? "var(--yellow)" : "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: 15,
                }}>
                  {total > 0 ? `${total.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท` : "—"}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ชี้แจง (กรณีส่วนต่างลิตรติดลบ/ใช้น้ำมันเกิน)</label>
                <input type="text" name="explanation" placeholder="เช่น รถติดในเมือง, บรรทุกหนัก..." className="form-input" />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">หมายเหตุทั่วไป</label>
                <input type="text" name="note" placeholder="หมายเหตุเพิ่มเติม..." className="form-input" />
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
              <Link href="/logs/energy" className="btn btn-ghost">ยกเลิก</Link>
            )}
            <button type="submit" disabled={isSubmitting || !lockedDate} className="btn btn-primary">
              {isSubmitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกการเติมน้ำมัน"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
