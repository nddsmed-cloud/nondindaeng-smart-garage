// src/app/gis/page.tsx
// GIS Overview — Dashboard สรุปสถิติ GIS กองช่าง

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "GIS กองช่าง | ระบบจัดการงานกองช่างเทศบาล",
  description: "ระบบสารสนเทศภูมิศาสตร์ (GIS) กองช่าง เทศบาลตำบลโนนดินแดง",
};

async function getGISStats() {
  const [totalRoads, allFixtures, allRegistrations] = await Promise.all([
    prisma.infraAsset.count(),
    prisma.roadFixture.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.roadRegistration.aggregate({
      _sum: { lengthKm: true },
      _count: { id: true },
    }),
  ]);

  const fixtureSummary: Record<string, number> = {};
  allFixtures.forEach((f) => { fixtureSummary[f.type] = f._count.id; });

  return {
    totalRoads,
    totalLengthKm: allRegistrations._sum.lengthKm ?? 0,
    registeredCount: allRegistrations._count.id,
    streetlights: fixtureSummary["STREETLIGHT"] ?? 0,
    trafficSigns: fixtureSummary["TRAFFIC_SIGN"] ?? 0,
    cctvs: fixtureSummary["CCTV"] ?? 0,
    others: fixtureSummary["OTHER"] ?? 0,
  };
}

async function getRecentRoads() {
  return prisma.infraAsset.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { registration: true, _count: { select: { fixtures: true } } },
  });
}

export default async function GISPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [stats, recentRoads] = await Promise.all([getGISStats(), getRecentRoads()]);

  const statCards = [
    { icon: "🛣️", label: "ถนนทั้งหมด", value: `${stats.totalRoads} สาย`, color: "var(--primary, #3b82f6)" },
    { icon: "📏", label: "ระยะทางรวม", value: `${stats.totalLengthKm.toFixed(2)} กม.`, color: "#8b5cf6" },
    { icon: "💡", label: "เสาไฟฟ้า", value: `${stats.streetlights} ต้น`, color: "#f59e0b" },
    { icon: "🚦", label: "ป้ายจราจร", value: `${stats.trafficSigns} ป้าย`, color: "#10b981" },
    { icon: "📷", label: "กล้อง CCTV", value: `${stats.cctvs} ตัว`, color: "#ef4444" },
    { icon: "📌", label: "สิ่งติดตั้งอื่นๆ", value: `${stats.others} รายการ`, color: "#6b7280" },
  ];

  const surfaceLabels: Record<string, string> = {
    ASPHALT: "ลาดยาง",
    CONCRETE: "คอนกรีต",
    LATERITE: "ลูกรัง",
    GRAVEL: "หินคลุก",
    EARTH: "ดิน",
  };

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0891b2 100%)",
          borderRadius: "var(--radius-lg, 16px)",
          padding: "28px 28px 24px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 6px" }}>
          ระบบสารสนเทศภูมิศาสตร์
        </p>
        <h1 style={{ color: "white", fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>
          🗺️ GIS กองช่าง
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 20px" }}>
          ทะเบียนถนน สิ่งติดตั้ง และแผนที่โครงข่ายถนน เทศบาลตำบลโนนดินแดง
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/gis/roads/new" className="btn btn-success" style={{ fontSize: 13 }}>
            + เพิ่มถนนใหม่
          </Link>
          <Link href="/gis/roads" className="btn btn-ghost" style={{ fontSize: 13, color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
            🛣️ ทะเบียนถนน
          </Link>
          <Link href="/gis/map" className="btn btn-ghost" style={{ fontSize: 13, color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
            📍 แผนที่ GIS
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {statCards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "var(--bg-card, white)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "18px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-sm)",
                background: `${c.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          { href: "/gis/roads/new", icon: "➕", label: "เพิ่มถนนใหม่", desc: "บันทึกสายถนนสายใหม่เข้าระบบ", className: "gis-action-card green" },
          { href: "/gis/roads", icon: "🛣️", label: "ทะเบียนถนน ทถ.3", desc: "ดูและแก้ไขรายละเอียดถนนทุกสาย", className: "gis-action-card blue" },
          { href: "/gis/map", icon: "📍", label: "แผนที่ GIS + Fixture", desc: "ดูแผนที่และสิ่งติดตั้งบนถนน", className: "gis-action-card purple" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={a.className}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* ถนนล่าสุด */}
      {recentRoads.length > 0 && (
        <div
          style={{
            background: "var(--bg-card, white)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>🛣️ ถนนที่บันทึกล่าสุด</h2>
            <Link href="/gis/roads" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>
              ดูทั้งหมด →
            </Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-hover)" }}>
                {["ชื่อถนน", "รหัสสาย", "ระยะทาง", "ผิวจราจร", "สิ่งติดตั้ง", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary)", textAlign: "left", borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRoads.map((road) => (
                <tr key={road.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{road.name}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{road.registration?.routeCode || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>{road.registration?.lengthKm ? `${road.registration.lengthKm} กม.` : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>{road.registration?.surfaceType ? surfaceLabels[road.registration.surfaceType] || road.registration.surfaceType : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="badge badge-blue">{road._count.fixtures} รายการ</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/gis/roads/${road.id}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                      ดูรายละเอียด →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
