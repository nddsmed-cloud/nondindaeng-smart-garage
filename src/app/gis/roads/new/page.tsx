"use client";
// src/app/gis/roads/new/page.tsx
// เพิ่มถนนสายใหม่

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewRoadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [routeCode, setRouteCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("กรุณาระบุชื่อถนน"); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/gis/roads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), routeCode: routeCode.trim() || undefined }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/gis/roads/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 0 40px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/gis" style={{ color: "var(--text-muted)", textDecoration: "none" }}>GIS กองช่าง</Link>
        <span>›</span>
        <Link href="/gis/roads" style={{ color: "var(--text-muted)", textDecoration: "none" }}>ทะเบียนถนน</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>เพิ่มถนนใหม่</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
        ➕ เพิ่มถนนสายใหม่
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>
        กรอกชื่อถนนและรหัสสายทาง จากนั้นกดบันทึกเพื่อเริ่มกรอกข้อมูล ทถ.3 และเพิ่มสิ่งติดตั้ง
      </p>

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
              ชื่อถนน <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <input
              className="form-input"
              placeholder="เช่น ถนนสายโนนดินแดง-ซับคง"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
              รหัสสายทาง (ทถ.3)
              <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 6 }}>(ถ้ามี)</span>
            </label>
            <input
              className="form-input"
              placeholder="เช่น นด.ถ. 1-0001"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
            />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              รหัสสายทางตามแบบฟอร์ม ทถ.3 ของกรมโยธาธิการและผังเมือง
            </p>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "var(--red-soft)",
              color: "var(--red)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Link href="/gis/roads" className="btn btn-ghost">ยกเลิก</Link>
            <button type="submit" disabled={saving} className="btn btn-success">
              {saving ? "กำลังสร้าง..." : "สร้างถนนและกรอกรายละเอียด →"}
            </button>
          </div>
        </form>
      </div>

      {/* Info box */}
      <div
        style={{
          marginTop: 16,
          padding: "14px 16px",
          background: "var(--primary-soft, #eff6ff)",
          borderRadius: "var(--radius-sm)",
          borderLeft: "3px solid var(--primary, #3b82f6)",
          fontSize: 13,
          color: "var(--text-secondary)",
        }}
      >
        <strong>ขั้นตอนหลังสร้างถนน:</strong>
        <ol style={{ margin: "6px 0 0 16px", padding: 0, lineHeight: 1.8 }}>
          <li>กรอกรายละเอียด ทถ.3 (มิติทาง / ผิวจราจร / เอกสารสิทธิ์)</li>
          <li>เพิ่มสิ่งติดตั้งบนถนน (เสาไฟ / ป้าย / กล้อง CCTV)</li>
          <li>วาดแนวเส้นทางบนแผนที่ GIS</li>
        </ol>
      </div>
    </div>
  );
}
