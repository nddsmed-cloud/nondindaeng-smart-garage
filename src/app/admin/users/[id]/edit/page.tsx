import { prisma } from "../../../../../lib/prisma";
import Link from "next/link";
import { ROLE_LABELS } from "../../../../../lib/auth-helpers";
import { updateUser } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) return notFound();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">แก้ไขผู้ใช้งาน</h1>
          <p className="page-subtitle">แก้ไขข้อมูลและกำหนดสิทธิ์ (Role) ในการใช้งานระบบ</p>
        </div>
        <Link href="/admin/users" className="btn btn-secondary">
          ย้อนกลับ
        </Link>
      </div>

      <div className="form-container">
        <form action={updateUser} className="form-grid">
          <input type="hidden" name="id" value={user.id} />
          
          <div className="form-group">
            <label className="form-label">ชื่อ-นามสกุล</label>
            <input type="text" name="name" className="form-input" required defaultValue={user.name} />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้ (Username) - เปลี่ยนไม่ได้</label>
            <input type="text" className="form-input" disabled defaultValue={user.username} />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)</label>
            <input type="password" name="password" className="form-input" placeholder="รหัสผ่านใหม่" minLength={6} />
          </div>

          <div className="form-group">
            <label className="form-label">สังกัด/แผนก</label>
            <select name="department" className="form-select" required defaultValue={user.department}>
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
            <select name="role" className="form-select" required defaultValue={user.role}>
              <option value="ADMIN">👑 {ROLE_LABELS.ADMIN}</option>
              <option value="MANAGER">🧑‍💼 {ROLE_LABELS.MANAGER}</option>
              <option value="OFFICER">👨‍💻 {ROLE_LABELS.OFFICER}</option>
              <option value="DRIVER">🚗 {ROLE_LABELS.DRIVER}</option>
            </select>
          </div>

          <div className="form-actions" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
