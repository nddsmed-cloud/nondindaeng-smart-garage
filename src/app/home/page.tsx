"use client";
// src/app/home/page.tsx
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();
  
  if (!session) return <div className="loading-state">กำลังโหลด...</div>;

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">ยินดีต้อนรับสู่ ระบบจัดการงานกองช่างเทศบาล</h1>
        <p className="page-subtitle">กรุณาเลือกระบบที่คุณต้องการใช้งาน</p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24,
        marginTop: 32,
      }}>
        {/* Vehicle System Card */}
        <Link href="/dashboard" 
          onClick={() => localStorage.setItem("ndd_module", "vehicle")}
          style={{ textDecoration: "none" }}
        >
          <div style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            borderRadius: 16,
            padding: 32,
            color: "white",
            boxShadow: "0 10px 30px rgba(37, 99, 235, 0.2)",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "pointer",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(37, 99, 235, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(37, 99, 235, 0.2)";
          }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ระบบยานพาหนะ</h2>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, flex: 1 }}>
              Smart Garage — ระบบบริหารจัดการรถยนต์ส่วนกลาง การจองรถ บันทึกการเดินทาง ทะเบียนรถ และรายงานการใช้น้ำมัน
            </p>
            <div style={{ 
              marginTop: 24, 
              padding: "10px 16px", 
              background: "rgba(255,255,255,0.2)", 
              borderRadius: 8,
              display: "inline-block",
              fontWeight: 600,
              fontSize: 14,
            }}>
              เข้าสู่ระบบยานพาหนะ →
            </div>
          </div>
        </Link>

        {/* GIS System Card */}
        <Link href="/gis" 
          onClick={() => localStorage.setItem("ndd_module", "gis")}
          style={{ textDecoration: "none" }}
        >
          <div style={{
            background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
            borderRadius: 16,
            padding: 32,
            color: "white",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "pointer",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(16, 185, 129, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(16, 185, 129, 0.2)";
          }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ระบบ GIS กองช่าง</h2>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, flex: 1 }}>
              ระบบแผนที่สารสนเทศภูมิศาสตร์ ทะเบียนถนน (ทถ.3) พิกัดสิ่งก่อสร้าง เสาไฟส่องสว่าง และการแจ้งซ่อมบำรุง
            </p>
            <div style={{ 
              marginTop: 24, 
              padding: "10px 16px", 
              background: "rgba(255,255,255,0.2)", 
              borderRadius: 8,
              display: "inline-block",
              fontWeight: 600,
              fontSize: 14,
            }}>
              เข้าสู่ระบบ GIS →
            </div>
          </div>
        </Link>
      </div>
      
      {/* Overview Stats (Placeholder for unified dashboard elements if needed) */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>
          ข้อมูลเบื้องต้น
        </h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ background: "var(--bg-card)", padding: "16px 24px", borderRadius: 12, border: "1px solid var(--border)", minWidth: 200 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>ผู้ใช้งานปัจจุบัน</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{session.user.name}</div>
            <div style={{ fontSize: 12, color: "var(--blue)" }}>{session.user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
