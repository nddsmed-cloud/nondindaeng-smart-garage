"use client";

import { useState, useEffect } from "react";
import { createFuelLog, getLatestMileage } from "../../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Vehicle = { id: string; licensePlate: string; brand: string; model: string };

export default function NewFuelForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startMileage, setStartMileage] = useState<number | string>("");
  const [liters, setLiters] = useState("");
  const [price, setPrice] = useState("");
  const [showOptional, setShowOptional] = useState(false);
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
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "20px" }}>⛽ บันทึกการเติมน้ำมัน</h1>
        </div>
        {!isLiff && <Link href="/logs/energy" className="btn btn-ghost btn-sm">← กลับ</Link>}
      </div>

      <div className="card" style={{ padding: "20px" }}>
        <form action={handleSubmit}>
          {/* Hidden Flags */}
          <input type="hidden" name="isLiff" value={isLiff ? "true" : "false"} />
          <input type="hidden" name="fuelDate" value={lockedDate} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* รถยนต์ */}
            <div className="form-group">
              <label className="form-label">รถยนต์ที่เติม *</label>
              <select 
                name="vehicleId" 
                required 
                className="form-select"
                style={{ fontSize: "16px", padding: "14px" }}
                onChange={async (e) => {
                  const vid = e.target.value;
                  if (vid) {
                    const latest = await getLatestMileage(vid);
                    setStartMileage(latest);
                  } else {
                    setStartMileage("");
                  }
                }}
              >
                <option value="">-- เลือกรถยนต์ --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} — {v.brand}
                  </option>
                ))}
              </select>
            </div>

            {/* เลขไมล์ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">เลขไมล์เริ่ม</label>
                <input 
                  type="number" 
                  name="startMileage" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required 
                  min={0} 
                  className="form-input" 
                  style={{ fontSize: "16px", padding: "14px" }}
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ไมล์สิ้นสุด *</label>
                <input 
                  type="number" 
                  name="endMileage" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required 
                  min={0} 
                  className="form-input" 
                  style={{ fontSize: "16px", padding: "14px", borderColor: "var(--blue)" }}
                />
              </div>
            </div>

            {/* ค่าน้ำมัน */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">จำนวนลิตร *</label>
                <input
                  type="number"
                  name="liters"
                  inputMode="decimal"
                  required
                  min={0}
                  step={0.01}
                  className="form-input"
                  style={{ fontSize: "16px", padding: "14px" }}
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ราคา/ลิตร *</label>
                <input
                  type="number"
                  name="pricePerLiter"
                  inputMode="decimal"
                  required
                  min={0}
                  step={0.01}
                  className="form-input"
                  style={{ fontSize: "16px", padding: "14px" }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* รวมเป็นเงิน */}
            <div className="form-group">
              <label className="form-label">ยอดชำระรวม (บาท)</label>
              <div style={{
                background: "var(--bg-hover)",
                border: "1px dashed var(--green)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                textAlign: "center",
                color: total > 0 ? "var(--green)" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "24px",
              }}>
                {total > 0 ? `${total.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿` : "—"}
              </div>
            </div>

            {/* ส่วนขยาย */}
            <button 
              type="button" 
              onClick={() => setShowOptional(!showOptional)}
              style={{
                background: "none", border: "none", color: "var(--blue)", 
                fontSize: "13px", fontWeight: 600, textAlign: "center",
                marginTop: "8px", cursor: "pointer", padding: "8px"
              }}
            >
              {showOptional ? "▲ ซ่อนข้อมูลเพิ่มเติม" : "▼ กรอกปั๊มน้ำมัน / หมายเหตุ (ถ้ามี)"}
            </button>

            {showOptional && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--bg-surface)", padding: "16px", borderRadius: "8px" }}>
                <div className="form-group">
                  <label className="form-label">สถานีน้ำมัน</label>
                  <input type="text" name="fuelStation" placeholder="เช่น ปตท. สาขา..." className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">ชี้แจง (ใช้น้ำมันเกิน)</label>
                  <input type="text" name="explanation" placeholder="เช่น รถติด, บรรทุกหนัก" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">หมายเหตุ</label>
                  <input type="text" name="note" className="form-input" />
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "24px" }}>
            <button 
              type="submit" 
              disabled={isSubmitting || !lockedDate} 
              className="btn btn-primary"
              style={{ width: "100%", padding: "16px", fontSize: "16px", borderRadius: "12px" }}
            >
              {isSubmitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกการเติมน้ำมัน"}
            </button>
            {isLiff && (
              <button 
                type="button" 
                onClick={async () => {
                  const liff = (await import("@line/liff")).default;
                  liff.closeWindow();
                }} 
                className="btn btn-ghost"
                style={{ width: "100%", marginTop: "12px", padding: "12px", borderRadius: "12px" }}
              >
                ยกเลิก (ปิดหน้าต่าง)
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
