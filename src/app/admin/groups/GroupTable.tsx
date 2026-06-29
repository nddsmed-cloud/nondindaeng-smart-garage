"use client";

import { useState } from "react";
import { createGroupAccess, deleteGroupAccess } from "./actions";

type Group = {
  id: string;
  lineGroupId: string;
  departmentName: string;
  defaultRole: string;
};

export default function GroupTable({ groups }: { groups: Group[] }) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createGroupAccess(formData);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบกลุ่ม LINE นี้ออกจากระบบ?")) return;
    setDeletingId(id);
    await deleteGroupAccess(id);
    setDeletingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ฟอร์มเพิ่มกลุ่มใหม่ */}
      <div className="card h-fit md:col-span-1">
        <h3 className="text-lg font-bold text-teal-800 mb-6 flex items-center gap-2">
          <span className="text-xl">➕</span> เพิ่มกลุ่มใหม่
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">LINE Group ID</label>
            <input type="text" name="lineGroupId" required className="form-input" placeholder="เช่น C1234567890abcdef..." />
            <span className="text-xs text-slate-500 mt-1">ได้จาก Webhook หรือ Context ของ LIFF</span>
          </div>
          <div className="form-group">
            <label className="form-label">กอง / สังกัด</label>
            <input type="text" name="departmentName" required className="form-input" placeholder="เช่น กองช่าง" />
          </div>
          <div className="form-group">
            <label className="form-label">สิทธิ์การใช้งานเริ่มต้น</label>
            <select name="defaultRole" className="form-select">
              <option value="DRIVER">พนักงานขับรถ (DRIVER)</option>
              <option value="OFFICER">เจ้าหน้าที่ (OFFICER)</option>
              <option value="MANAGER">ผู้อำนวยการ (MANAGER)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary mt-4 justify-center w-full">
            {loading ? "กำลังบันทึก..." : "เพิ่มกลุ่ม"}
          </button>
        </form>
      </div>

      {/* ตารางแสดงกลุ่ม */}
      <div className="md:col-span-2">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>LINE Group ID</th>
                <th>กอง / สังกัด</th>
                <th>สิทธิ์เริ่มต้น</th>
                <th style={{ textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    ยังไม่มีการลงทะเบียนกลุ่ม LINE
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id}>
                    <td className="font-mono text-xs text-slate-500">
                      {group.lineGroupId}
                    </td>
                    <td className="font-semibold text-slate-800">{group.departmentName}</td>
                    <td>
                      <span className="badge badge-blue">
                        {group.defaultRole}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(group.id)}
                        disabled={deletingId === group.id}
                        className="btn btn-danger btn-sm"
                      >
                        🗑 ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
