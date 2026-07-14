"use client";

import { useState } from "react";
import { createMaintenanceDocument } from "./actions";
import { Template1, Template2, Template3, Template4 } from "../../../../components/documents/MaintenanceTemplates";
import Link from "next/link";

export default function MaintenanceDocClient({ vehicle }: { vehicle: any }) {
  const [formData, setFormData] = useState({
    vehicleId: vehicle.id,
    mileage: "",
    symptoms: "",
    partsReplaced: "",
    estimatedCost: "",
    garageName: "",
    garageReason: "ประหยัดงบประมาณ อะไหล่ตรงรุ่น และอยู่นอกระยะประกัน",
    committee1: "",
    committee2: "",
    committee3: "",
    inspectorName: "",
    reporterName: "",
  });

  const [savedData, setSavedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createMaintenanceDocument(formData);
    setIsSubmitting(false);
    if (result.success) {
      setSavedData(formData);
    } else {
      alert("Error saving document: " + result.error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (savedData) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen print:p-0 print:bg-white print:max-w-none">
        <div className="print:hidden bg-white p-6 rounded-xl shadow-sm mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-slate-800">เอกสารพร้อมพิมพ์</h1>
            <div className="flex gap-2">
              <button onClick={() => window.location.reload()} className="btn btn-ghost">สร้างใหม่</button>
              <Link href={`/vehicles/${vehicle.id}`} className="btn btn-secondary">กลับไปหน้ารถ</Link>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(num => (
              <button 
                key={num}
                onClick={() => setActiveTab(num)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                หมวดที่ {num}
              </button>
            ))}
          </div>

          <button onClick={handlePrint} className="w-full btn bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-bold shadow-md">
            🖨️ สั่งพิมพ์เอกสารหมวดที่ {activeTab}
          </button>
        </div>

        {/* Print Area - Only the active tab will be visible on screen, but we might want to print just the active one */}
        <div className="print:block bg-white shadow-lg mx-auto print:shadow-none overflow-hidden print:overflow-visible">
          {activeTab === 1 && <Template1 data={savedData} vehicle={vehicle} />}
          {activeTab === 2 && <Template2 data={savedData} vehicle={vehicle} />}
          {activeTab === 3 && <Template3 data={savedData} vehicle={vehicle} />}
          {activeTab === 4 && <Template4 data={savedData} vehicle={vehicle} />}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header print:hidden">
        <div>
          <h1 className="page-title text-2xl font-bold text-teal-800 flex items-center gap-2">
            <span>🛠️</span> สร้างเอกสารซ่อมบำรุง (ว 2600)
          </h1>
          <p className="page-subtitle text-slate-500 mt-1">สำหรับรถ {vehicle.licensePlate} {vehicle.province}</p>
        </div>
      </div>

      <div className="card max-w-4xl print:hidden">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title flex items-center gap-2">
              <span className="text-base">📋</span> 1. ข้อมูลการแจ้งซ่อม
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">เลขไมล์ปัจจุบัน</label>
                <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} className="form-input" placeholder="เช่น 125000" />
              </div>
              <div className="form-group">
                <label className="form-label">อาการที่พบ</label>
                <textarea name="symptoms" required value={formData.symptoms} onChange={handleChange} className="form-textarea" rows={2} placeholder="เช่น สตาร์ทไม่ติด เฟืองไดสตาร์ทรูด" />
              </div>
              <div className="form-group">
                <label className="form-label">ผู้แจ้งซ่อม (พนักงานขับรถ)</label>
                <input type="text" name="reporterName" required value={formData.reporterName} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ผู้ตรวจสอบสภาพรถ (ช่าง)</label>
                <input type="text" name="inspectorName" required value={formData.inspectorName} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section mt-8">
            <h3 className="form-section-title flex items-center gap-2">
              <span className="text-base">🏢</span> 2. ข้อมูลการซ่อมและอู่
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">รายการอะไหล่ที่ต้องเปลี่ยน</label>
                <input type="text" name="partsReplaced" required value={formData.partsReplaced} onChange={handleChange} className="form-input" placeholder="เช่น เฟืองไดสตาร์ท 1 ชุด" />
              </div>
              <div className="form-group">
                <label className="form-label">ประมาณการค่าใช้จ่าย (บาท)</label>
                <div className="relative">
                  <input type="number" name="estimatedCost" required value={formData.estimatedCost} onChange={handleChange} className="form-input w-full pr-12" placeholder="เช่น 1300" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">THB</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ชื่ออู่ซ่อม / ร้านค้า</label>
                <input type="text" name="garageName" required value={formData.garageName} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">เหตุผลที่เลือกอู่นี้</label>
                <input type="text" name="garageReason" required value={formData.garageReason} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section mt-8">
            <h3 className="form-section-title flex items-center gap-2">
              <span className="text-base">🧑‍⚖️</span> 3. รายชื่อคณะกรรมการตรวจรับพัสดุ
            </h3>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label">ประธานกรรมการ</label>
                <input type="text" name="committee1" required value={formData.committee1} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">กรรมการ คนที่ 1</label>
                <input type="text" name="committee2" required value={formData.committee2} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">กรรมการ คนที่ 2</label>
                <input type="text" name="committee3" required value={formData.committee3} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-actions mt-6">
            <Link href={`/vehicles/${vehicle.id}`} className="btn btn-ghost">ยกเลิก</Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                "💾 บันทึกข้อมูลและออกเอกสาร"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
