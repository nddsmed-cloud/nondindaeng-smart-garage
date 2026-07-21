"use client";
// src/components/Sidebar.tsx — Context Switching Sidebar
// สลับโหมด 🚗 ยานพาหนะ ↔ 🗺️ GIS กองช่าง

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "../lib/auth-helpers";

type Module = "vehicle" | "gis";

type NavLink = { href: string; icon: string; label: string; roles: UserRole[] };

const vehicleNavItems: NavLink[] = [
  // ── แดชบอร์ด ──
  { href: "/dashboard", icon: "🏠", label: "แดชบอร์ด e-Office", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS"] },

  // ── ยานพาหนะ ──
  { href: "/dashboard/approvals", icon: "✅", label: "อนุมัติคำขอใช้รถ", roles: ["ADMIN", "MANAGER"] },
  { href: "/vehicles", icon: "🚗", label: "ทะเบียนรถยนต์", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/requests", icon: "📝", label: "คำขออนุญาตใช้รถ", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/logs", icon: "🗺", label: "บันทึกการเดินทาง", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/logs/energy", icon: "⛽", label: "บันทึกการเติมน้ำมัน", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/logs/maintenance", icon: "🔧", label: "แบบ ๖ ซ่อมบำรุง", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/reports/mileage", icon: "📖", label: "สมุดบันทึกประวัติรถ", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/reports/oag", icon: "📊", label: "รายงานพัสดุ สตง.", roles: ["ADMIN", "OFFICER"] },

  // ── e-Office (บริการประชาชน) ──
  { href: "/dashboard/permits", icon: "🏗️", label: "ใบอนุญาตก่อสร้าง", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/dashboard/complaints", icon: "📣", label: "เรื่องร้องเรียน", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS"] },
  { href: "/saraban", icon: "📬", label: "สารบรรณ", roles: ["ADMIN", "MANAGER", "OFFICER"] },

  // ── จัดการระบบ ──
  { href: "/admin/users", icon: "👥", label: "จัดการผู้ใช้งาน", roles: ["ADMIN"] },
  { href: "/admin/groups", icon: "💬", label: "จัดการกลุ่ม LINE", roles: ["ADMIN"] },
];

const gisNavItems: NavLink[] = [
  { href: "/gis", icon: "📊", label: "ภาพรวม GIS", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  { href: "/gis/roads", icon: "🛣️", label: "ทะเบียนถนน ทถ.3", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  { href: "/gis/map", icon: "📍", label: "แผนที่ GIS + สิ่งติดตั้ง", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  // เมนูแก้ไข — เฉพาะเจ้าหน้าที่ขึ้นไป
  { href: "/gis/roads/new", icon: "➕", label: "เพิ่มถนนใหม่", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS"] },
  // e-Office ใน GIS module
  { href: "/dashboard/complaints", icon: "📣", label: "เรื่องร้องเรียน", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS"] },
];

// ตรวจว่า path ปัจจุบันอยู่ใน module ไหน
function detectModule(pathname: string): Module {
  if (pathname.startsWith("/gis")) return "gis";
  return "vehicle";
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "OFFICER") as UserRole;

  // module state — เริ่มที่ค่าเริ่มต้นก่อน (vehicle) จะ sync ใน useEffect เพื่อเลี่ยง hydration mismatch
  const [module, setModule] = useState<Module>("vehicle");

  // sync module เมื่อ navigate ข้าม module หรือโหลดหน้าใหม่
  useEffect(() => {
    const savedModule = localStorage.getItem("ndd_module") as Module;
    const currentIsGis = pathname.startsWith("/gis");
    const currentIsVehicle = ["/dashboard", "/vehicles", "/requests", "/logs", "/reports", "/admin"].some(p => pathname.startsWith(p));
    
    if (currentIsGis) {
      setModule("gis");
      localStorage.setItem("ndd_module", "gis");
    } else if (currentIsVehicle) {
      setModule("vehicle");
      localStorage.setItem("ndd_module", "vehicle");
    } else if (savedModule) {
      setModule(savedModule);
    } else {
      setModule(detectModule(pathname));
    }
  }, [pathname]);

  const handleModuleChange = (m: Module) => {
    setModule(m);
    localStorage.setItem("ndd_module", m);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/gis") return pathname === "/gis";
    return pathname.startsWith(href);
  };

  const navItems = module === "gis" ? gisNavItems : vehicleNavItems;
  const visibleLinks = navItems.filter((link) => link.roles.includes(role));

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏛️</div>
        <div>
          <div className="sidebar-logo-title">กองช่างเทศบาล</div>
          <div className="sidebar-logo-sub">ตำบลโนนดินแดง</div>
        </div>
      </div>

      {/* Module Switcher */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
      }}>
        <button
          onClick={() => handleModuleChange("vehicle")}
          style={{
            padding: "7px 4px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            transition: "all 0.2s",
            background: module === "vehicle"
              ? "linear-gradient(135deg, #1e3a8a, #2563eb)"
              : "var(--bg-hover)",
            color: module === "vehicle" ? "white" : "var(--text-muted)",
            boxShadow: module === "vehicle" ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
          }}
        >
          🚗 ยานพาหนะ
        </button>
        <button
          onClick={() => handleModuleChange("gis")}
          style={{
            padding: "7px 4px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            transition: "all 0.2s",
            background: module === "gis"
              ? "linear-gradient(135deg, #065f46, #059669)"
              : "var(--bg-hover)",
            color: module === "gis" ? "white" : "var(--text-muted)",
            boxShadow: module === "gis" ? "0 2px 8px rgba(5,150,105,0.3)" : "none",
          }}
        >
          🗺️ GIS
        </button>
      </div>

      {/* Section Label */}
      <div style={{
        padding: "8px 12px 4px",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-muted)",
      }}>
        {module === "vehicle" ? "🚗 ระบบยานพาหนะ" : "🗺️ GIS กองช่าง"}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
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
      </nav>

      {/* Quick Switch Footer */}
      {module === "vehicle" ? (
        <div style={{ padding: "6px 10px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => handleModuleChange("gis")}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px dashed var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🗺️ สลับไป GIS กองช่าง →
          </button>
        </div>
      ) : (
        <div style={{ padding: "6px 10px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => handleModuleChange("vehicle")}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px dashed var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🚗 สลับไปยานพาหนะ →
          </button>
        </div>
      )}

      {/* User Info + Logout */}
      <div style={{ padding: "10px 10px 12px", borderTop: "1px solid var(--border)" }}>
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
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: "var(--text-muted)" }}>
          &copy; ระบบจัดการงานกองช่างเทศบาล<br/>
          เครดิต โดย ผอ.สรพงษ์
        </div>
      </div>
    </aside>
  );
}
