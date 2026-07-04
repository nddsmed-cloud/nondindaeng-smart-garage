"use client";

import { useState } from "react";
import { createVehicle } from "../vehicle-actions";
import Link from "next/link";
import ThaiDateInput from "../../../components/ui/ThaiDateInput";

export default function CreateVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">เพิ่มรถยนต์ใหม่</h1>
          <p className="page-subtitle">กรอกข้อมูลทะเบียนรถยนต์ส่วนกลาง (คส.1)</p>
        </div>
        <Link href="/vehicles" className="btn btn-ghost">← กลับ</Link>
      </div>

      <div className="card">
        <form action={async (f) => { setIsSubmitting(true); await createVehicle(f); }} className="space-y-6">

          {/* ข้อมูลทะเบียน */}
          <div className="form-section">
            <div className="form-section-title">ข้อมูลทะเบียนรถ</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">วันที่จดทะเบียน *</label>
                <ThaiDateInput name="registeredDate" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">เลขทะเบียน *</label>
                <input type="text" name="licensePlate" required placeholder="เช่น กค 1234" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">จังหวัด *</label>
                <input type="text" name="province" required placeholder="เช่น กรุงเทพมหานคร" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">สถานะ</label>
                <select name="status" className="form-select">
                  <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                  <option value="ส่งซ่อม">ส่งซ่อม</option>
                  <option value="ยกเลิกใช้งาน">ยกเลิกใช้งาน</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">สังกัด (กอง/หน่วยงาน)</label>
                <select name="department" className="form-select" required defaultValue="กองช่าง">
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
                <input type="text" name="assetNumber" placeholder="เช่น 123-45-6789" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ราคาที่ได้มา (บาท)</label>
                <input type="number" name="acquiredPrice" placeholder="เช่น 750000" step="any" defaultValue={0} className="form-input" />
              </div>
            </div>
          </div>

          {/* ข้อมูลรถ */}
          <div className="form-section">
            <div className="form-section-title">ข้อมูลรถยนต์</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ประเภทรถ *</label>
                <input type="text" name="vehicleType" required placeholder="เช่น รถยนต์นั่งส่วนบุคคล" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ลักษณะรถ *</label>
                <input type="text" name="bodyType" required placeholder="เช่น นั่งสองตอนท้ายบรรทุก" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ยี่ห้อ *</label>
                <input type="text" name="brand" required placeholder="เช่น Toyota" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">รุ่น *</label>
                <input type="text" name="model" required placeholder="เช่น Hilux Revo" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">สีรถ *</label>
                <input type="text" name="color" required placeholder="เช่น ขาว" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ชนิดเชื้อเพลิง *</label>
                <select name="fuelType" className="form-select">
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
                <input type="text" name="chassisNumber" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">เลขเครื่องยนต์ *</label>
                <input type="text" name="engineNumber" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">ความจุเครื่องยนต์ (CC)</label>
                <input type="number" name="engineCapacity" defaultValue={0} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">น้ำหนักรถ (กก.)</label>
                <input type="number" name="emptyWeight" defaultValue={0} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">น้ำหนักบรรทุก (กก.)</label>
                <input type="number" name="payloadWeight" defaultValue={0} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">น้ำหนักรวม (กก.)</label>
                <input type="number" name="totalWeight" defaultValue={0} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link href="/vehicles" className="btn btn-ghost">ยกเลิก</Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกข้อมูลรถยนต์"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
