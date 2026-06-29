import { createUser } from "../actions";
import Link from "next/link";
import { ROLE_LABELS } from "../../../../lib/auth-helpers";

export default function NewUserPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">เพิ่มผู้ใช้งานใหม่</h1>
          <p className="page-subtitle">เพิ่มผู้ใช้งานใหม่และกำหนดสิทธิ์ (Role) ในการใช้งานระบบ</p>
        </div>
        <Link href="/admin/users" className="btn btn-secondary">
          ย้อนกลับ
        </Link>
      </div>

      <div className="form-container">
        <form action={createUser} className="form-grid">
          <div className="form-group">
            <label className="form-label">ชื่อ-นามสกุล</label>
            <input type="text" name="name" className="form-input" required placeholder="เช่น สมชาย ใจดี" />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้ (Username)</label>
            <input type="text" name="username" className="form-input" required placeholder="เช่น somchai" />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน (Password)</label>
            <input type="password" name="password" className="form-input" required placeholder="กำหนดรหัสผ่าน" minLength={6} />
          </div>

          <div className="form-group">
            <label className="form-label">สังกัด/แผนก</label>
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
            <label className="form-label">บทบาท (Role)</label>
            <select name="role" className="form-select" required defaultValue="OFFICER">
              <option value="ADMIN">👑 {ROLE_LABELS.ADMIN}</option>
              <option value="MANAGER">🧑‍💼 {ROLE_LABELS.MANAGER}</option>
              <option value="OFFICER">👨‍💻 {ROLE_LABELS.OFFICER}</option>
              <option value="DRIVER">🚗 {ROLE_LABELS.DRIVER}</option>
            </select>
          </div>

          <div className="form-actions" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              บันทึกผู้ใช้งานใหม่
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
