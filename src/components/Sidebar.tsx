"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ROLE_LABELS, ROLE_COLORS, PERMISSIONS, type UserRole } from "../lib/auth-helpers";

type NavLink = { href: string; icon: string; label: string; roles: UserRole[] };
type NavSection = { section: string; links: NavLink[] };

const navItems: NavSection[] = [
  {
    section: "หลัก",
    links: [
      { href: "/dashboard", icon: "🏠", label: "แดชบอร์ด", roles: ["ADMIN", "MANAGER"] },
      { href: "/dashboard/approvals", icon: "✅", label: "อนุมัติคำขอ (คส.1)", roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    section: "ข้อมูลรถยนต์",
    links: [
      { href: "/vehicles", icon: "🚗", label: "ทะเบียนรถยนต์", roles: ["ADMIN", "OFFICER"] },
      { href: "/requests", icon: "📝", label: "คำขออนุญาตใช้รถ", roles: ["ADMIN", "MANAGER", "OFFICER"] },
    ],
  },
  {
    section: "บันทึกการใช้งาน",
    links: [
      { href: "/logs", icon: "🗺", label: "บันทึกการเดินทาง", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
      { href: "/logs/energy", icon: "⛽", label: "บันทึกการเติมน้ำมัน", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
      { href: "/logs/maintenance", icon: "🔧", label: "แบบ ๖ ซ่อมบำรุง", roles: ["ADMIN", "MANAGER", "OFFICER"] },
    ],
  },
  {
    section: "รายงานและการจัดการ",
    links: [
      { href: "/reports/mileage", icon: "📖", label: "สมุดบันทึกประวัติรถ", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
      { href: "/reports/oag", icon: "📊", label: "รายงานพัสดุ สตง.", roles: ["ADMIN", "OFFICER"] },
      { href: "/admin/users", icon: "👥", label: "จัดการผู้ใช้งาน", roles: ["ADMIN"] },
      { href: "/admin/groups", icon: "💬", label: "จัดการกลุ่ม LINE", roles: ["ADMIN"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "OFFICER") as UserRole;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚘</div>
        <div className="sidebar-logo-title">NDD Smart Garage</div>
        <div className="sidebar-logo-sub">ระบบบริหารจัดการรถยนต์</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => {
          const visibleLinks = section.links.filter((link) =>
            link.roles.includes(role)
          );
          if (visibleLinks.length === 0) return null;

          return (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${isActive(link.href) ? "active" : ""}`}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div style={{
        padding: "12px 10px",
        borderTop: "1px solid var(--border)",
      }}>
        {session?.user && (
          <div style={{
            background: "var(--bg-hover)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {session.user.name}
              </div>
              <span className={`badge ${ROLE_COLORS[role]}`} style={{ fontSize: 10 }}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            {session.user.department && (
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {session.user.department}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--red-soft)";
            e.currentTarget.style.color = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <span>🚪</span> ออกจากระบบ
        </button>

        {/* Credit */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", color: "var(--text-muted)" }}>
          &copy; NDD Smart Garage<br/>
          เครดิต โดย ผอ.สรพงษ์
        </div>
      </div>
    </aside>
  );
}
