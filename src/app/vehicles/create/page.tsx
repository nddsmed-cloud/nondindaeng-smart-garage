"use client";

import { useState, useRef } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ThaiDateInput from "../../../components/ui/ThaiDateInput";

export default function CreateVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์ภาพมีขนาดใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        router.push("/vehicles");
      } else {
        alert(result.error || "Failed to create vehicle");
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Page Header */}
        <div className="card-header">
          <h1 className="text-3xl font-bold text-slate-800">เพิ่มรถยนต์ใหม่</h1>
          <p className="text-slate-500 mt-1">กรอกข้อมูลเพื่อขึ้นทะเบียนรถยนต์ส่วนกลาง (คส.1)</p>
          <Link href="/vehicles" className="button-secondary flex items-center gap-2">
            <span>←</span> กลับหน้ารายการรถ
          </Link>
        </div>
        
        {/* Hidden Input for Base64 Image */}
        <input type="hidden" name="imageUrl" value={imagePreview || ""} />

        {/* 1. ข้อมูลพื้นฐาน */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-blue-500">🚙</span> ข้อมูลพื้นฐาน
            </h2>
          </div>
          <div className="card-body grid-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ทะเบียนรถ <span className="text-red-500">*</span></label>
              <input type="text" name="licensePlate" required placeholder="เช่น กค 1234" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">จังหวัด <span className="text-red-500">*</span></label>
              <input type="text" name="province" required placeholder="เช่น บุรีรัมย์" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ยี่ห้อ <span className="text-red-500">*</span></label>
              <input type="text" name="brand" required placeholder="เช่น Toyota" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">รุ่น <span className="text-red-500">*</span></label>
              <input type="text" name="model" required placeholder="เช่น Hilux Revo" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ประเภทรถ <span className="text-red-500">*</span></label>
              <input type="text" name="vehicleType" required placeholder="เช่น รถบรรทุกขนาดเล็ก" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">สีรถ <span className="text-red-500">*</span></label>
              <input type="text" name="color" required placeholder="เช่น ขาว" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ปีจดทะเบียน <span className="text-red-500">*</span></label>
              <ThaiDateInput name="registeredDate" required className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ความจุเครื่องยนต์ (CC)</label>
              <input type="number" name="engineCapacity" placeholder="เช่น 2400" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">เชื้อเพลิง <span className="text-red-500">*</span></label>
              <select name="fuelType" className="select">
                <option value="ดีเซล">ดีเซล</option>
                <option value="เบนซิน">เบนซิน</option>
                <option value="แก๊ส NGV">แก๊ส NGV</option>
                <option value="ไฮบริด">ไฮบริด</option>
                <option value="ไฟฟ้า">ไฟฟ้า (EV)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">มูลค่าทรัพย์สิน / ราคาที่ได้มา (บาท)</label>
              <input type="number" name="acquiredPrice" step="any" placeholder="เช่น 850000" className="input" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-4">
              {/* Optional hidden fields for backwards compatibility that aren't prominent in the new UI */}
              <input type="hidden" name="bodyType" value="รถยนต์ส่วนบุคคล" />
              <input type="hidden" name="chassisNumber" value="N/A" />
              <input type="hidden" name="engineNumber" value="N/A" />
            </div>
          </div>
        </div>

        {/* 2. ข้อมูลทางราชการ (คส.1) */}
        <div className="card">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-teal-500">🏛️</span> ข้อมูลทางราชการ (คส.1)
            </h2>
          </div>
          <div className="card-body grid-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">หมายเลขครุภัณฑ์</label>
              <input type="text" name="assetNumber" placeholder="เช่น 123-45-6789" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">หน่วยงานรับผิดชอบ</label>
              <select name="department" className="select">
                <option value="กองช่าง">กองช่าง</option>
                <option value="สำนักปลัดเทศบาล">สำนักปลัดเทศบาล</option>
                <option value="กองคลัง">กองคลัง</option>
                <option value="กองสาธารณสุขและสิ่งแวดล้อม">กองสาธารณสุขและสิ่งแวดล้อม</option>
                <option value="กองการศึกษา">กองการศึกษา</option>
                <option value="กองสวัสดิการสังคม">กองสวัสดิการสังคม</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่รับเข้าระบบ</label>
              <input type="date" disabled defaultValue={new Date().toISOString().split('T')[0]} className="input" />
              <p className="text-xs text-slate-400 mt-1">* ระบบจะบันทึกวันที่ปัจจุบันอัตโนมัติเมื่อสร้างข้อมูล</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">สถานะการใช้งาน</label>
              <select name="status" className="select">
                <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                <option value="ส่งซ่อม">ส่งซ่อม</option>
                <option value="ยกเลิกใช้งาน">ยกเลิกใช้งาน</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. ภาพประกอบ */}
        <div className="card">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-purple-500">📷</span> ภาพประกอบ
            </h2>
          </div>
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Upload Zone */}
              <div className="w-full md:w-1/2">
                <div className="border-2 border-dashed rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="text-4xl mb-3">🖼️</div>
                  <h3 className="font-bold text-slate-700 mb-1">คลิกเพื่ออัปโหลดภาพตัวรถ</h3>
                  <p className="text-sm text-slate-500">รองรับไฟล์ .jpg, .png, .webp (สูงสุด 5MB)</p>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <button type="button" className="button-secondary">เลือกไฟล์รูปภาพ</button>
                </div>
              </div>

              {/* Preview Zone */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <h3 className="font-semibold text-slate-700 mb-3 self-start">ภาพตัวอย่าง (Preview)</h3>
                {imagePreview ? (
                  <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-slate-700 hover:scale-110 transition-transform shadow-lg" title="เปลี่ยนภาพ">
                        🔄
                      </button>
                      <button type="button" onClick={removeImage} className="p-2 bg-rose-500 rounded-full text-white hover:scale-110 transition-transform shadow-lg" title="ลบภาพ">
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-sm h-48 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                    ยังไม่มีรูปภาพ
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 4. ข้อมูลเพิ่มเติม */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-amber-500">📋</span> ข้อมูลเพิ่มเติม
            </h2>
          </div>
          <div className="card-body">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์ GIS / ระบบติดตาม (Tracking System URL)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔗</span>
                <input type="url" name="gisLink" placeholder="https://..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">หมายเหตุ / ประวัติการใช้งาน</label>
              <textarea name="notes" rows={4} placeholder="ระบุข้อมูลเพิ่มเติม ประวัติการรับรถ หรือบันทึกพิเศษ..." className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* 5. ปุ่มดำเนินการ (Sticky Footer) */}
        <div className="sticky-footer">
          <div className="max-w-5xl mx-auto flex items-center justify-end gap-4">
            <Link href="/vehicles" className="button-secondary">ยกเลิก</Link>
            <button type="submit" disabled={isSubmitting} className="button-primary flex items-center gap-2">
              {isSubmitting ? (<>⏳ กำลังบันทึก...</>) : (<>💾 บันทึกข้อมูลรถยนต์</>)}
            </button>
          </div>
        </div>
        
      </form>
    </div>
  );
}
