// src/app/gis/roads/page.tsx
// ทะเบียนถนนทั้งหมด (roads-map) — ตารางพร้อมค้นหา

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import RoadsTable from "./RoadsTable";

export const metadata = {
  title: "ทะเบียนถนน | GIS กองช่าง",
};

async function getRoads() {
  return prisma.infraAsset.findMany({
    include: {
      registration: true,
      _count: { select: { fixtures: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function RoadsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const roads = await getRoads();

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Link href="/gis" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              GIS กองช่าง
            </Link>
            <span style={{ color: "var(--text-muted)" }}>›</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ทะเบียนถนน</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            🛣️ ทะเบียนถนน (ทถ.3)
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>
            รายการถนนทุกสายพร้อมรายละเอียดเชิงกายภาพ
          </p>
        </div>
        <Link href="/gis/roads/new" className="btn btn-success">
          + เพิ่มถนนใหม่
        </Link>
      </div>

      <RoadsTable roads={roads} />
    </div>
  );
}
