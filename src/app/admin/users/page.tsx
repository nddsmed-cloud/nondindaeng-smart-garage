// src/app/admin/users/page.tsx
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { auth } from "../../../auth";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  const counts = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">จัดการผู้ใช้งาน</h1>
          <p className="page-subtitle">
            ผู้ใช้งานทั้งหมด <strong style={{ color: "var(--blue)" }}>{counts.total}</strong> คน &nbsp;·&nbsp;
            ใช้งานอยู่ <strong style={{ color: "var(--green)" }}>{counts.active}</strong> คน
          </p>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary">
          + เพิ่มผู้ใช้งานใหม่
        </Link>
      </div>

      {/* Role Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {["ADMIN", "MANAGER", "OFFICER", "DRIVER"].map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const icons: Record<string, string> = {
            ADMIN: "👑", MANAGER: "🧑‍💼", OFFICER: "👨‍💻", DRIVER: "🚗"
          };
          const labels: Record<string, string> = {
            ADMIN: "ผู้ดูแลระบบ", MANAGER: "ผู้บริหาร", OFFICER: "เจ้าหน้าที่", DRIVER: "พนักงานขับรถ"
          };
          const colors: Record<string, string> = {
            ADMIN: "red", MANAGER: "purple", OFFICER: "blue", DRIVER: "green"
          };
          return (
            <div key={role} className="stat-card">
              <div className={`stat-icon ${colors[role]}`}>{icons[role]}</div>
              <div>
                <div className="stat-label">{labels[role]}</div>
                <div className="stat-value">{count}</div>
                <div className="stat-sub">คน</div>
              </div>
            </div>
          );
        })}
      </div>

      <UsersTable users={users} currentUserId={session?.user?.id ?? ""} />
    </>
  );
}
