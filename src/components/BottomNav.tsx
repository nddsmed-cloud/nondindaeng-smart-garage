"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { type UserRole } from "../lib/auth-helpers";
import MobileDrawer from "./MobileDrawer";

export default function BottomNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // If unauthenticated, don't show
  if (!session) return null;

  const role = (session.user?.role ?? "OFFICER") as UserRole;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Main items for the bottom nav (we only fit 3 + 1 Menu button)
  const isGisModule = pathname.startsWith("/gis");
  
  const vehicleNavItems = [
    { href: "/dashboard", icon: "🏠", label: "หน้าหลัก", roles: ["ADMIN", "MANAGER", "OFFICER", "DRIVER"] },
    { href: "/vehicles", icon: "🚗", label: "รถยนต์", roles: ["ADMIN", "MANAGER", "OFFICER"] },
    { href: "/requests", icon: "📝", label: "คำขอ", roles: ["ADMIN", "MANAGER", "OFFICER"] },
  ];

  const gisNavItems = [
    { href: "/gis", icon: "📊", label: "หน้าหลัก", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
    { href: "/gis/roads", icon: "🛣️", label: "ถนน", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
    { href: "/gis/map", icon: "📍", label: "แผนที่", roles: ["ADMIN", "MANAGER", "OFFICER", "OFFICER_GIS", "DRIVER"] },
  ];

  const mainNavItems = isGisModule ? gisNavItems : vehicleNavItems;

  const visibleItems = mainNavItems.filter((item) => item.roles.includes(role));

  return (
    <>
      <nav className="bottom-nav">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive(item.href) ? "active" : ""}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
        
        {/* The Menu Button to open Drawer */}
        <button 
          className="bottom-nav-item" 
          onClick={() => setIsDrawerOpen(true)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span className="bottom-nav-icon">☰</span>
          <span className="bottom-nav-label">เมนู</span>
        </button>
      </nav>

      {/* The side drawer for mobile */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
