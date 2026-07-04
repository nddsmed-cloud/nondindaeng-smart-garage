"use client";
// src/components/MobileDrawer.tsx — Context-aware Mobile Drawer
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "../lib/auth-helpers";

type Module = "vehicle" | "gis";

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const vehicleNavItems = [
  { href: "/dashboard", icon: "🏠", label: "แดชบอร์ด", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/vehicles", icon: "🚗", label: "ข้อมูลรถยนต์", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/requests", icon: "📝", label: "คำขออนุญาตใช้รถ", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/logs", icon: "🗺", label: "บันทึกการเดินทาง", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/logs/energy", icon: "⛽", label: "บันทึกการเติมน้ำมัน", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/logs/maintenance", icon: "🔧", label: "แบบ ๖ ซ่อมบำรุง", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  { href: "/reports/mileage", icon: "📖", label: "สมุดบันทึกประวัติรถ", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
  { href: "/reports/oag", icon: "📊", label: "รายงานพัสดุ สตง.", roles: ["ADMIN", "OFFICER"] },
  { href: "/admin/users", icon: "👥", label: "จัดการผู้ใช้งาน", roles: ["ADMIN"] },
  { href: "/admin/groups", icon: "💬", label: "จัดการกลุ่ม LINE", roles: ["ADMIN"] },
];

const gisNavItems = [
  { href: "/gis", icon: "📊", label: "GIS Overview", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  { href: "/gis/roads/new", icon: "➕", label: "เพิ่มถนนใหม่", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  { href: "/gis/roads", icon: "🛣️", label: "ทะเบียนถนน ทถ.3", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  { href: "/gis/map", icon: "📍", label: "แผนที่ GIS + Fixture", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
];

function detectModule(pathname: string): Module {
  if (pathname.startsWith("/gis")) return "gis";
  return "vehicle";
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isIOS, isAndroid, canUseCamera } = useDeviceDetection();
  const [drawerModule, setDrawerModule] = useState<Module>("vehicle");

  useEffect(() => {
    const savedModule = localStorage.getItem("ndd_module") as Module;
    const currentIsGis = pathname.startsWith("/gis");
    const currentIsVehicle = ["/dashboard", "/vehicles", "/requests", "/logs", "/reports", "/admin"].some(p => pathname.startsWith(p));
    
    if (currentIsGis) {
      setDrawerModule("gis");
      localStorage.setItem("ndd_module", "gis");
    } else if (currentIsVehicle) {
      setDrawerModule("vehicle");
      localStorage.setItem("ndd_module", "vehicle");
    } else if (savedModule) {
      setDrawerModule(savedModule);
    } else {
      setDrawerModule(detectModule(pathname));
    }
  }, [pathname]);

  const handleModuleChange = (m: Module) => {
    setDrawerModule(m);
    localStorage.setItem("ndd_module", m);
  };

  if (!session) return null;
  const role = (session.user?.role ?? "OFFICER") as UserRole;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/gis") return pathname === "/gis";
    return pathname.startsWith(href);
  };

  const navItems = drawerModule === "gis" ? gisNavItems : vehicleNavItems;
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`drawer-panel ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <span style={{ fontSize: 24 }}>🏛️</span>
            <div style={{ marginLeft: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>กองช่างเทศบาล</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>ตำบลโนนดินแดง</div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Module Switcher */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
        }}>
          {([
            { key: "vehicle", label: "🚗 ยานพาหนะ", from: "#1e3a8a", to: "#2563eb" },
            { key: "gis", label: "🗺️ GIS", from: "#065f46", to: "#059669" },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => handleModuleChange(m.key)}
              style={{
                padding: "8px 4px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                background: drawerModule === m.key
                  ? `linear-gradient(135deg, ${m.from}, ${m.to})`
                  : "var(--bg-hover)",
                color: drawerModule === m.key ? "white" : "var(--text-muted)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="drawer-user">
          <div style={{ fontWeight: 600, fontSize: 13 }}>{session.user?.name}</div>
          <div style={{ marginTop: 4 }}>
            <span className={`badge ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</span>
          </div>
          {session.user?.department && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {session.user.department}
            </div>
          )}
        </div>

        <nav className="drawer-nav">
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", padding: "4px 0 6px" }}>
            {drawerModule === "vehicle" ? "🚗 ระบบยานพาหนะ" : "🗺️ GIS กองช่าง"}
          </div>
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`drawer-link ${isActive(item.href) ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="drawer-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Camera / Device */}
        <div className="drawer-device-features">
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
            ตรวจจับระบบ: {isIOS ? "iOS (Apple)" : isAndroid ? "Android" : "ระบบทั่วไป"}
          </div>
          {canUseCamera && (
            <button className="btn btn-success" style={{ width: "100%", justifyContent: "center" }}>
              📸 สแกน QR Code รถ
            </button>
          )}
        </div>

        <div className="drawer-footer">
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            🚪 ออกจากระบบ
          </button>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "var(--text-muted)" }}>
            &copy; ระบบจัดการงานกองช่างเทศบาล
          </div>
        </div>
      </div>
    </>
  );
}
