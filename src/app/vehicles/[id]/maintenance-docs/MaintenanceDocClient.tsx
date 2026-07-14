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
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">สร้างเอกสารซ่อมบำรุง</h1>
            <p className="text-slate-500">สำหรับรถ {vehicle.licensePlate} {vehicle.province}</p>
          </div>
          <Link href={`/vehicles/${vehicle.id}`} className="btn btn-ghost">← ยกเลิก</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-blue-800 border-b pb-2">1. ข้อมูลการแจ้งซ่อม</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เลขไมล์ปัจจุบัน</label>
                <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" placeholder="เช่น 125000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">อาการที่พบ</label>
                <textarea name="symptoms" required value={formData.symptoms} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" rows={2} placeholder="เช่น สตาร์ทไม่ติด เฟืองไดสตาร์ทรูด" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ผู้แจ้งซ่อม (พนักงานขับรถ)</label>
                <input type="text" name="reporterName" required value={formData.reporterName} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ตรวจสอบสภาพรถ (ช่าง)</label>
                <input type="text" name="inspectorName" required value={formData.inspectorName} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-amber-700 border-b pb-2">2. ข้อมูลการซ่อมและอู่</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รายการอะไหล่ที่ต้องเปลี่ยน</label>
                <input type="text" name="partsReplaced" required value={formData.partsReplaced} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" placeholder="เช่น เฟืองไดสตาร์ท 1 ชุด" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ประมาณการค่าใช้จ่าย (บาท)</label>
                <input type="number" name="estimatedCost" required value={formData.estimatedCost} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" placeholder="เช่น 1300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่ออู่ซ่อม / ร้านค้า</label>
                <input type="text" name="garageName" required value={formData.garageName} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เหตุผลที่เลือกอู่นี้</label>
                <input type="text" name="garageReason" required value={formData.garageReason} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h3 className="font-bold text-lg text-emerald-700 border-b pb-2">3. รายชื่อคณะกรรมการตรวจรับพัสดุ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประธานกรรมการ</label>
                  <input type="text" name="committee1" required value={formData.committee1} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">กรรมการ คนที่ 1</label>
                  <input type="text" name="committee2" required value={formData.committee2} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">กรรมการ คนที่ 2</label>
                  <input type="text" name="committee3" required value={formData.committee3} onChange={handleChange} className="w-full p-2 border rounded-md bg-slate-50" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button type="submit" disabled={isSubmitting} className="w-full btn bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg shadow-md transition-all">
              {isSubmitting ? "กำลังบันทึก..." : "💾 บันทึกข้อมูลและออกเอกสาร"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
