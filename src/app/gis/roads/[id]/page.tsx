// src/app/gis/roads/[id]/page.tsx
// หน้าข้อมูล ทถ.3 รายละเอียดถนน + FixtureManager

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import RoadDetailForm from "./RoadDetailForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const road = await prisma.infraAsset.findUnique({ where: { id } });
  return { title: road ? `${road.name} | ทถ.3` : "ถนน | GIS กองช่าง" };
}

export default async function RoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const road = await prisma.infraAsset.findUnique({
    where: { id },
    include: {
      registration: true,
      fixtures: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!road) notFound();

  // path เป็น Json — แปลงเป็น array
  const path = Array.isArray(road.path) ? road.path as { lat: number; lng: number }[] : [];

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/gis" style={{ color: "var(--text-muted)", textDecoration: "none" }}>GIS กองช่าง</Link>
        <span>›</span>
        <Link href="/gis/roads" style={{ color: "var(--text-muted)", textDecoration: "none" }}>ทะเบียนถนน</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{road.name}</span>
      </div>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginBottom: 24,
          color: "white",
        }}
      >
        <p style={{ fontSize: 12, opacity: 0.75, margin: "0 0 4px" }}>แบบรายละเอียดเส้นทาง (ทถ.3)</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{road.name}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {road.registration?.routeCode && (
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>
              รหัส: {road.registration.routeCode}
            </span>
          )}
          <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>
            {path.length >= 2 ? `มีแนวเส้นทาง ${path.length} จุด` : "ยังไม่มีแนวเส้นทาง"}
          </span>
          <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>
            สิ่งติดตั้ง {road.fixtures.length} รายการ
          </span>
        </div>
      </div>

      <RoadDetailForm road={road} path={path} />
    </div>
  );
}
