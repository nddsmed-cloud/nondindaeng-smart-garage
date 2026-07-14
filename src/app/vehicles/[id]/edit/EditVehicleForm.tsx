"use client";

import { useState, useRef } from "react";
import { updateVehicle } from "../../vehicle-actions";
import { getBangkokDateString } from "../../../../lib/date-formatter";
import ThaiDateInput from "../../../../components/ui/ThaiDateInput";
import Link from "next/link";

type Vehicle = {
  id: string;
  registeredDate: string | Date;
  licensePlate: string;
  province: string;
  vehicleType: string;
  bodyType: string;
  brand: string;
  model: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  fuelType: string;
  engineCapacity: number;
  emptyWeight: number;
  payloadWeight: number;
  totalWeight: number;
  status: string;
  department: string | null;
  assetNumber: string | null;
  acquiredPrice: number | null;
  imageUrl: string | null;
  notes: string | null;
  gisLink: string | null;
  createdAt?: string | Date;
};

export default function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(vehicle.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedDate = vehicle.registeredDate
    ? getBangkokDateString(vehicle.registeredDate)
    : "";

  const createdDateStr = vehicle.createdAt 
    ? new Date(vehicle.createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

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

  const handleAction = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    const result = await updateVehicle(vehicle.id, formData);
    if (result && !result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">แก้ไขข้อมูลรถยนต์</h1>
          <p className="text-slate-500 mt-1">อัปเดตข้อมูลทะเบียนรถยนต์ส่วนกลาง (คส.1)</p>
        </div>
        <Link href={`/vehicles/${vehicle.id}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <span>←</span> กลับหน้ารายละเอียด
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
          <span>❌</span> {error}
        </div>
      )}

      <form action={handleAction} className="space-y-8">
        
        {/* Hidden Input for Base64 Image */}
        <input type="hidden" name="imageUrl" value={imagePreview || ""} />

        {/* 1. ข้อมูลพื้นฐาน */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-blue-500">🚙</span> ข้อมูลพื้นฐาน
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ทะเบียนรถ <span className="text-red-500">*</span></label>
              <input type="text" name="licensePlate" required defaultValue={vehicle.licensePlate} placeholder="เช่น กค 1234" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">จังหวัด <span className="text-red-500">*</span></label>
              <input type="text" name="province" required defaultValue={vehicle.province} placeholder="เช่น บุรีรัมย์" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ยี่ห้อ <span className="text-red-500">*</span></label>
              <input type="text" name="brand" required defaultValue={vehicle.brand} placeholder="เช่น Toyota" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">รุ่น <span className="text-red-500">*</span></label>
              <input type="text" name="model" required defaultValue={vehicle.model} placeholder="เช่น Hilux Revo" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ประเภทรถ <span className="text-red-500">*</span></label>
              <input type="text" name="vehicleType" required defaultValue={vehicle.vehicleType} placeholder="เช่น รถบรรทุกขนาดเล็ก" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">สีรถ <span className="text-red-500">*</span></label>
              <input type="text" name="color" required defaultValue={vehicle.color} placeholder="เช่น ขาว" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ปีจดทะเบียน <span className="text-red-500">*</span></label>
              <ThaiDateInput name="registeredDate" required defaultValue={formattedDate} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ความจุเครื่องยนต์ (CC)</label>
              <input type="number" name="engineCapacity" defaultValue={vehicle.engineCapacity} placeholder="เช่น 2400" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">เชื้อเพลิง <span className="text-red-500">*</span></label>
              <select name="fuelType" defaultValue={vehicle.fuelType} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                <option value="ดีเซล">ดีเซล</option>
                <option value="เบนซิน">เบนซิน</option>
                <option value="แก๊ส NGV">แก๊ส NGV</option>
                <option value="ไฮบริด">ไฮบริด</option>
                <option value="ไฟฟ้า">ไฟฟ้า (EV)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">มูลค่าทรัพย์สิน / ราคาที่ได้มา (บาท)</label>
              <input type="number" name="acquiredPrice" step="any" defaultValue={vehicle.acquiredPrice || 0} placeholder="เช่น 850000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-4">
              <input type="hidden" name="bodyType" value={vehicle.bodyType || "รถยนต์ส่วนบุคคล"} />
              <input type="hidden" name="chassisNumber" value={vehicle.chassisNumber || "N/A"} />
              <input type="hidden" name="engineNumber" value={vehicle.engineNumber || "N/A"} />
              <input type="hidden" name="emptyWeight" value={vehicle.emptyWeight || 0} />
              <input type="hidden" name="payloadWeight" value={vehicle.payloadWeight || 0} />
              <input type="hidden" name="totalWeight" value={vehicle.totalWeight || 0} />
            </div>
          </div>
        </div>

        {/* 2. ข้อมูลทางราชการ (คส.1) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-teal-500">🏛️</span> ข้อมูลทางราชการ (คส.1)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">หมายเลขครุภัณฑ์</label>
              <input type="text" name="assetNumber" defaultValue={vehicle.assetNumber || ""} placeholder="เช่น 123-45-6789" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">หน่วยงานรับผิดชอบ</label>
              <select name="department" defaultValue={vehicle.department || "กองช่าง"} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white">
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
              <input type="date" disabled defaultValue={createdDateStr} className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">สถานะการใช้งาน</label>
              <select name="status" defaultValue={vehicle.status || "พร้อมใช้งาน"} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white">
                <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                <option value="ส่งซ่อม">ส่งซ่อม</option>
                <option value="ยกเลิกใช้งาน">ยกเลิกใช้งาน</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. ภาพประกอบ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-purple-500">📷</span> ภาพประกอบ
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Upload Zone */}
              <div className="w-full md:w-1/2">
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
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
                  <button type="button" className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                    เปลี่ยนไฟล์รูปภาพ
                  </button>
                </div>
              </div>

              {/* Preview Zone */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <h3 className="font-semibold text-slate-700 mb-3 self-start">ภาพตัวอย่าง (Preview)</h3>
                {imagePreview ? (
                  <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-md border border-slate-200 group">
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
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ลิงก์ GIS / ระบบติดตาม (Tracking System URL)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔗</span>
                <input type="url" name="gisLink" defaultValue={vehicle.gisLink || ""} placeholder="https://..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">หมายเหตุ / ประวัติการใช้งาน</label>
              <textarea name="notes" defaultValue={vehicle.notes || ""} rows={4} placeholder="ระบุข้อมูลเพิ่มเติม ประวัติการรับรถ หรือบันทึกพิเศษ..." className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* 5. ปุ่มดำเนินการ (Sticky Footer) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-end gap-4">
            <Link href={`/vehicles/${vehicle.id}`} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              ยกเลิก
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 flex items-center gap-2">
              {isSubmitting ? (
                <><span>⏳</span> กำลังบันทึก...</>
              ) : (
                <><span>💾</span> บันทึกการแก้ไข</>
              )}
            </button>
          </div>
        </div>
        
      </form>
    </div>
  );
}
