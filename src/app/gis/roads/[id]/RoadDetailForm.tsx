"use client";
// src/app/gis/roads/[id]/RoadDetailForm.tsx
// Form กรอกข้อมูล ทถ.3 + FixtureManager

import { useState } from "react";
import dynamic from "next/dynamic";
import type React from "react";

export type LatLng = { lat: number; lng: number };

type FixtureManagerProps = {
  assetId: string;
  assetName: string;
  roadPath?: LatLng[];
};

const FixtureManager = dynamic<FixtureManagerProps>(
  () => import("../../../../components/gis/FixtureManager"),
  { ssr: false }
);


type Fixture = {
  id: string;
  type: string;
  detail: string | null;
  lat: number;
  lng: number;
  status: string;
  note: string | null;
};

type Registration = {
  routeCode: string | null;
  lengthKm: number | null;
  surfaceType: string | null;
  pavementWidth: number | null;
  rightOfWayWidth: number | null;
  shoulderWidth: number | null;
  sidewalkWidth: number | null;
  drainageDetail: string | null;
  landDocumentType: string | null;
} | null;

type Road = {
  id: string;
  name: string;
  registration: Registration;
  fixtures: Fixture[];
};

const SURFACE_TYPES = [
  { value: "ASPHALT", label: "ลาดยาง" },
  { value: "CONCRETE", label: "คอนกรีต (ค.ส.ล.)" },
  { value: "LATERITE", label: "ลูกรัง" },
  { value: "GRAVEL", label: "หินคลุก" },
  { value: "EARTH", label: "ดิน" },
];

const LAND_DOC_TYPES = [
  { value: "TITLE_DEED", label: "มีเอกสารสิทธิ์ที่ดิน (โฉนด/น.ส.3)" },
  { value: "TT4_DEDICATION", label: "หนังสืออุทิศที่ดิน (ทถ.4)" },
  { value: "TT5_CERTIFICATION", label: "หนังสือรับรองที่ดินสาธารณประโยชน์ (ทถ.5)" },
];

export default function RoadDetailForm({
  road,
  path,
}: {
  road: Road;
  path: LatLng[];
}) {
  const r = road.registration;
  const [form, setForm] = useState({
    routeCode: r?.routeCode ?? "",
    lengthKm: r?.lengthKm?.toString() ?? "",
    surfaceType: r?.surfaceType ?? "",
    pavementWidth: r?.pavementWidth?.toString() ?? "",
    rightOfWayWidth: r?.rightOfWayWidth?.toString() ?? "",
    shoulderWidth: r?.shoulderWidth?.toString() ?? "",
    sidewalkWidth: r?.sidewalkWidth?.toString() ?? "",
    drainageDetail: r?.drainageDetail ?? "",
    landDocumentType: r?.landDocumentType ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/gis/roads/${road.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setMessage(res.ok
      ? { type: "ok", text: "✅ บันทึกข้อมูล ทถ.3 สำเร็จ" }
      : { type: "err", text: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่" });
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const sectionHeaderStyle = {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 4px",
    paddingBottom: 10,
    borderBottom: "1px solid var(--border)",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    display: "block" as const,
    marginBottom: 5,
    color: "var(--text-secondary)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
      {/* Form ทถ.3 */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* ── ข้อมูลหลัก ── */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionHeaderStyle}>📋 ข้อมูลหลัก</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <div>
                <label style={labelStyle}>รหัสสายทาง</label>
                <input className="form-input" style={inputStyle} name="routeCode" value={form.routeCode} onChange={handleChange} placeholder="เช่น นด.ถ. 1-0001" />
              </div>
              <div>
                <label style={labelStyle}>ระยะทาง (กม.)</label>
                <input className="form-input" style={inputStyle} type="number" step="0.001" name="lengthKm" value={form.lengthKm} onChange={handleChange} placeholder="เช่น 1.275" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>ประเภทผิวจราจร</label>
                <select className="form-input" style={inputStyle} name="surfaceType" value={form.surfaceType} onChange={handleChange}>
                  <option value="">เลือกประเภท</option>
                  {SURFACE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── มิติทางกายภาพ ── */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionHeaderStyle}>📐 มิติทางกายภาพ</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              {[
                { name: "pavementWidth", label: "ความกว้างผิวจราจร (ม.)", placeholder: "เช่น 6.0" },
                { name: "rightOfWayWidth", label: "ความกว้างเขตทาง (ม.)", placeholder: "เช่น 10.0" },
                { name: "shoulderWidth", label: "ความกว้างไหลทาง (ม.)", placeholder: "เช่น 1.0" },
                { name: "sidewalkWidth", label: "ความกว้างทางเท้า (ม.)", placeholder: "ถ้าไม่มีให้เว้นว่าง" },
              ].map((f) => (
                <div key={f.name}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    className="form-input"
                    style={inputStyle}
                    type="number"
                    step="0.1"
                    name={f.name}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── ระบบระบายน้ำและเอกสารสิทธิ์ ── */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={sectionHeaderStyle}>📄 ระบบระบายน้ำและเอกสารสิทธิ์</h2>
            <div style={{ marginTop: 14 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>ชนิด/ขนาดโครงสร้างระบายน้ำ</label>
                <textarea
                  className="form-input"
                  style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
                  name="drainageDetail"
                  value={form.drainageDetail}
                  onChange={handleChange}
                  placeholder="เช่น ท่อ คสล. ขนาด 0.60 ม. ความยาว 250 ม."
                  rows={3}
                />
              </div>
              <div>
                <label style={labelStyle}>เอกสารสิทธิ์ที่ดิน</label>
                <select className="form-input" style={inputStyle} name="landDocumentType" value={form.landDocumentType} onChange={handleChange}>
                  <option value="">เลือกประเภทเอกสาร</option>
                  {LAND_DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Save */}
          {message && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              marginBottom: 14,
              background: message.type === "ok" ? "var(--green-soft, #dcfce7)" : "var(--red-soft, #fee2e2)",
              color: message.type === "ok" ? "var(--green, #16a34a)" : "var(--red, #dc2626)",
              fontSize: 13,
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={saving} className="btn btn-success">
              {saving ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล ทถ.3"}
            </button>
          </div>
        </form>
      </div>

      {/* FixtureManager */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
        }}
      >
        <FixtureManager assetId={road.id} assetName={road.name} roadPath={path} />
      </div>
    </div>
  );
}
