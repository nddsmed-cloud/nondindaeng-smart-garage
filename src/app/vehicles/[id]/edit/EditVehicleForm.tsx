"use client";

import { useState } from "react";
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
};

export default function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = vehicle.registeredDate
    ? getBangkokDateString(vehicle.registeredDate)
    : "";

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
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">แก้ไขข้อมูลรถยนต์</h1>
          <p className="page-subtitle">แก้ไขข้อมูลทะเบียนรถยนต์ส่วนกลาง (คส.1)</p>
        </div>
        <Link href={`/vehicles/${vehicle.id}`} className="btn btn-ghost">← กลับไปหน้ารายละเอียด</Link>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
            ❌ {error}
          </div>
        )}

        <form action={handleAction} className="space-y-6">

          {/* ข้อมูลทะเบียน */}
          <div className="form-section">
            <div className="form-section-title">ข้อมูลทะเบียนรถ</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">วันที่จดทะเบียน *</label>
                <ThaiDateInput
                  name="registeredDate"
                  required
                  defaultValue={formattedDate}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">เลขทะเบียน *</label>
                <input
                  type="text"
                  name="licensePlate"
                  required
                  placeholder="เช่น กค 1234"
                  defaultValue={vehicle.licensePlate}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">จังหวัด *</label>
                <input
                  type="text"
                  name="province"
                  required
                  placeholder="เช่น กรุงเทพมหานคร"
                  defaultValue={vehicle.province}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">สถานะ</label>
                <select name="status" defaultValue={vehicle.status} className="form-select">
                  <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                  <option value="ส่งซ่อม">ส่งซ่อม</option>
                  <option value="ยกเลิกใช้งาน">ยกเลิกใช้งาน</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">สังกัด (กอง/หน่วยงาน)</label>
                <select
                  name="department"
                  className="form-select"
                  required
                  defaultValue={vehicle.department || "กองช่าง"}
                >
                  <option value="สำนักปลัดเทศบาล">สำนักปลัดเทศบาล</option>
                  <option value="กองคลัง">กองคลัง</option>
                  <option value="กองช่าง">กองช่าง</option>
                  <option value="กองสาธารณสุขและสิ่งแวดล้อม">กองสาธารณสุขและสิ่งแวดล้อม</option>
                  <option value="กองการศึกษา">กองการศึกษา</option>
                  <option value="กองสวัสดิการสังคม">กองสวัสดิการสังคม</option>
                  <option value="กองยุทธศาสตร์และงบประมาณ">กองยุทธศาสตร์และงบประมาณ</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">หมายเลขครุภัณฑ์</label>
                <input
                  type="text"
                  name="assetNumber"
                  placeholder="เช่น 123-45-6789"
                  defaultValue={vehicle.assetNumber || ""}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ราคาที่ได้มา (บาท)</label>
                <input
                  type="number"
                  name="acquiredPrice"
                  placeholder="เช่น 750000"
                  step="any"
                  defaultValue={vehicle.acquiredPrice || 0}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* ข้อมูลรถ */}
          <div className="form-section">
            <div className="form-section-title">ข้อมูลรถยนต์</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ประเภทรถ *</label>
                <input
                  type="text"
                  name="vehicleType"
                  required
                  placeholder="เช่น รถยนต์นั่งส่วนบุคคล"
                  defaultValue={vehicle.vehicleType}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ลักษณะรถ *</label>
                <input
                  type="text"
                  name="bodyType"
                  required
                  placeholder="เช่น นั่งสองตอนท้ายบรรทุก"
                  defaultValue={vehicle.bodyType}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ยี่ห้อ *</label>
                <input
                  type="text"
                  name="brand"
                  required
                  placeholder="เช่น Toyota"
                  defaultValue={vehicle.brand}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">รุ่น *</label>
                <input
                  type="text"
                  name="model"
                  required
                  placeholder="เช่น Hilux Revo"
                  defaultValue={vehicle.model}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">สีรถ *</label>
                <input
                  type="text"
                  name="color"
                  required
                  placeholder="เช่น ขาว"
                  defaultValue={vehicle.color}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ชนิดเชื้อเพลิง *</label>
                <select name="fuelType" defaultValue={vehicle.fuelType} className="form-select">
                  <option value="ดีเซล">ดีเซล</option>
                  <option value="เบนซิน">เบนซิน</option>
                  <option value="แก๊ส NGV">แก๊ส NGV</option>
                  <option value="ไฮบริด">ไฮบริด</option>
                  <option value="ไฟฟ้า">ไฟฟ้า</option>
                </select>
              </div>
            </div>
          </div>

          {/* ข้อมูลเทคนิค */}
          <div className="form-section">
            <div className="form-section-title">ข้อมูลทางเทคนิค</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">เลขตัวถัง *</label>
                <input
                  type="text"
                  name="chassisNumber"
                  required
                  defaultValue={vehicle.chassisNumber}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">เลขเครื่องยนต์ *</label>
                <input
                  type="text"
                  name="engineNumber"
                  required
                  defaultValue={vehicle.engineNumber}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ความจุเครื่องยนต์ (CC)</label>
                <input
                  type="number"
                  name="engineCapacity"
                  defaultValue={vehicle.engineCapacity}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">น้ำหนักรถ (กก.)</label>
                <input
                  type="number"
                  name="emptyWeight"
                  defaultValue={vehicle.emptyWeight}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">น้ำหนักบรรทุก (กก.)</label>
                <input
                  type="number"
                  name="payloadWeight"
                  defaultValue={vehicle.payloadWeight}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">น้ำหนักรวม (กก.)</label>
                <input
                  type="number"
                  name="totalWeight"
                  defaultValue={vehicle.totalWeight}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link href={`/vehicles/${vehicle.id}`} className="btn btn-ghost">ยกเลิก</Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
