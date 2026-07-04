"use client";
// src/app/gis/roads/RoadsTable.tsx
// ตารางแสดงรายการถนนพร้อมค้นหา/กรอง

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Road = {
  id: string;
  name: string;
  createdAt: Date;
  registration: {
    routeCode: string | null;
    lengthKm: number | null;
    surfaceType: string | null;
    status: string;
  } | null;
  _count: { fixtures: number };
};

const SURFACE_LABELS: Record<string, string> = {
  ASPHALT: "ลาดยาง",
  CONCRETE: "คอนกรีต (ค.ส.ล.)",
  LATERITE: "ลูกรัง",
  GRAVEL: "หินคลุก",
  EARTH: "ดิน",
};

const SURFACE_COLORS: Record<string, string> = {
  ASPHALT: "#1d4ed8",
  CONCRETE: "#6b7280",
  LATERITE: "#d97706",
  GRAVEL: "#92400e",
  EARTH: "#166534",
};

export default function RoadsTable({ roads }: { roads: Road[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState("");

  const filtered = roads.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.registration?.routeCode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchSurface =
      !surfaceFilter || r.registration?.surfaceType === surfaceFilter;
    return matchSearch && matchSurface;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันลบถนน "${name}" และข้อมูลทั้งหมด?`)) return;
    await fetch(`/api/gis/roads/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
        }}
      >
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="🔍 ค้นหาชื่อถนน หรือ รหัสสายทาง..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ minWidth: 160 }}
          value={surfaceFilter}
          onChange={(e) => setSurfaceFilter(e.target.value)}
        >
          <option value="">ผิวจราจรทั้งหมด</option>
          {Object.entries(SURFACE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          แสดง {filtered.length} / {roads.length} สาย
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>🛣️</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {roads.length === 0 ? "ยังไม่มีถนนในระบบ" : "ไม่พบถนนที่ตรงกับการค้นหา"}
          </div>
          {roads.length === 0 && (
            <Link href="/gis/roads/new" className="btn btn-success" style={{ marginTop: 16, display: "inline-flex" }}>
              + เพิ่มถนนสายแรก
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-hover)" }}>
                {["ชื่อถนน", "รหัสสาย", "ระยะทาง", "ผิวจราจร", "สิ่งติดตั้ง", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((road) => {
                const surface = road.registration?.surfaceType;
                return (
                  <tr
                    key={road.id}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{road.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        เพิ่มเมื่อ {new Date(road.createdAt).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {road.registration?.routeCode || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {road.registration?.lengthKm
                        ? <span style={{ fontWeight: 600 }}>{road.registration.lengthKm} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>กม.</span></span>
                        : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {surface ? (
                        <span
                          className="badge"
                          style={{
                            background: `${SURFACE_COLORS[surface]}18`,
                            color: SURFACE_COLORS[surface],
                            border: `1px solid ${SURFACE_COLORS[surface]}40`,
                          }}
                        >
                          {SURFACE_LABELS[surface] || surface}
                        </span>
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="badge badge-blue">{road._count.fixtures} รายการ</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          href={`/gis/roads/${road.id}`}
                          className="btn btn-ghost"
                          style={{ fontSize: 12, padding: "5px 12px" }}
                        >
                          ดูรายละเอียด
                        </Link>
                        <button
                          onClick={() => handleDelete(road.id, road.name)}
                          className="btn btn-ghost"
                          style={{ fontSize: 12, padding: "5px 12px", color: "var(--red)" }}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
