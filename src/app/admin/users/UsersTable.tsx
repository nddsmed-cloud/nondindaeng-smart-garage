"use client";
// src/app/admin/users/UsersTable.tsx
import { useState } from "react";
import Link from "next/link";
import { toggleUserActive, deleteUser } from "./actions";
import {
  ROLE_LABELS, ROLE_COLORS, type UserRole,
} from "../../../lib/auth-helpers";

type User = {
  id: string;
  name: string;
  username: string;
  role: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
};

export default function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, isActive: boolean) => {
    setLoadingId(id);
    await toggleUserActive(id, !isActive);
    setLoadingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบผู้ใช้ "${name}"? การกระทำนี้ไม่สามารถยกเลิกได้`)) return;
    setLoadingId(id);
    await deleteUser(id);
    setLoadingId(null);
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ชื่อ-สกุล</th>
            <th>ชื่อผู้ใช้</th>
            <th>บทบาท</th>
            <th>สังกัด</th>
            <th>สถานะ</th>
            <th>วันที่สร้าง</th>
            <th style={{ textAlign: "right" }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="table-empty">
                  <div className="table-empty-icon">👥</div>
                  <div>ยังไม่มีผู้ใช้งานในระบบ</div>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className="td-primary">{user.name}</td>
                <td>
                  <code style={{
                    background: "var(--bg-surface)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "var(--blue)",
                  }}>
                    {user.username}
                  </code>
                </td>
                <td>
                  <span className={`badge ${ROLE_COLORS[user.role as UserRole]}`}>
                    {ROLE_LABELS[user.role as UserRole]}
                  </span>
                </td>
                <td>{user.department || "—"}</td>
                <td>
                  <span className={`badge ${user.isActive ? "badge-green" : "badge-red"}`}>
                    {user.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("th-TH")}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {/* ไม่สามารถ disable/ลบตัวเองได้ */}
                    {user.id !== currentUserId && (
                      <>
                        <Link href={`/admin/users/${user.id}/edit`} className="btn btn-primary btn-sm">
                          ✏️ แก้ไข
                        </Link>
                        <button
                          onClick={() => handleToggle(user.id, user.isActive)}
                          disabled={loadingId === user.id}
                          className={`btn btn-sm ${user.isActive ? "btn-warning" : "btn-success"}`}
                        >
                          {user.isActive ? "🔒 ปิดใช้งาน" : "🔓 เปิดใช้งาน"}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={loadingId === user.id}
                          className="btn btn-danger btn-sm"
                        >
                          🗑 ลบ
                        </button>
                      </>
                    )}
                    {user.id === currentUserId && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>บัญชีของคุณ</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
