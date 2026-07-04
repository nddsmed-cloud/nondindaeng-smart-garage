// src/app/vehicles/new/page.tsx
"use client";

import { useState } from "react";
import { submitVehicleRequest } from "../actions";
import ThaiDateInput from "../../../components/ui/ThaiDateInput";

export default function NewVehicleRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitVehicleRequest(formData);

    if (result.success) {
      alert("✅ ส่งคำขอเรียบร้อยแล้ว ระบบได้แจ้งเตือนไปยังไลน์ผู้อำนวยการฯ แล้ว");
      (e.target as HTMLFormElement).reset(); // ล้างข้อมูลในฟอร์ม
    } else {
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">
        ฟอร์มขออนุญาตใช้รถยนต์ส่วนกลาง
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ-สกุล ผู้ขอ</label>
            <input type="text" name="requesterName" required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">สังกัด (กอง/สำนัก)</label>
            <select name="department" className="w-full px-4 py-2 border rounded-md">
              <option value="กองช่าง">กองช่าง</option>
              <option value="สำนักปลัด">สำนักปลัด</option>
              <option value="กองคลัง">กองคลัง</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">วัตถุประสงค์การเดินทาง</label>
          <textarea name="purpose" required rows={3} className="w-full px-4 py-2 border rounded-md"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทรถที่ต้องการ</label>
            <select name="vehicleType" className="w-full px-4 py-2 border rounded-md">
              <option value="รถกระบะ">รถกระบะ</option>
              <option value="รถตู้">รถตู้</option>
              <option value="รถบรรทุกน้ำ">รถบรรทุกน้ำ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เดินทาง</label>
            <ThaiDateInput name="travelDate" required className="w-full px-4 py-2 border rounded-md" />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              isSubmitting ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขอใช้รถ"}
          </button>
        </div>
      </form>
    </div>
  );
}