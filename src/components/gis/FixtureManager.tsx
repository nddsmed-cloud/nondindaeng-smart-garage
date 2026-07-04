"use client";
// src/components/gis/FixtureManager.tsx
// จัดการ CRUD สิ่งติดตั้งบนถนน (เสาไฟ / ป้ายจราจร / CCTV)
// พร้อม Leaflet map picker สำหรับเลือกพิกัด

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { LatLng, FixtureMarker } from "./RoadMap";

const RoadMap = dynamic(() => import("./RoadMap"), { ssr: false });

type Fixture = {
  id: string;
  type: "STREETLIGHT" | "TRAFFIC_SIGN" | "CCTV" | "OTHER";
  detail: string | null;
  lat: number;
  lng: number;
  status: "NORMAL" | "UNDER_REPAIR" | "DAMAGED";
  note: string | null;
};

type FixtureManagerProps = {
  assetId: string;
  assetName: string;
  roadPath?: LatLng[];
};

const FIXTURE_TYPES = [
  { value: "STREETLIGHT", label: "💡 เสาไฟฟ้าแสงสว่าง" },
  { value: "TRAFFIC_SIGN", label: "🚦 ป้ายจราจร" },
  { value: "CCTV", label: "📷 กล้องวงจรปิด (CCTV)" },
  { value: "OTHER", label: "📌 อื่นๆ" },
];

const FIXTURE_STATUS = [
  { value: "NORMAL", label: "✅ ปกติ" },
  { value: "UNDER_REPAIR", label: "🔧 อยู่ระหว่างซ่อม" },
  { value: "DAMAGED", label: "❌ ชำรุด" },
];

// รายการวัสดุไฟฟ้า (อ้างอิงจากรายการวัสดุไฟฟ้าเทศบาล)
const DETAIL_OPTIONS: Record<string, string[]> = {
  STREETLIGHT: [
    "โคมไฟ LED 40W",
    "โคมไฟ LED 60W",
    "โคมไฟ LED 80W",
    "โคมไฟ LED 100W",
    "โคมไฟฟลูออเรสเซนต์ 36W",
    "โคมไฟประหยัดพลังงาน 20W",
    "เสาไฟกิ่งเดี่ยว",
    "เสาไฟกิ่งคู่",
  ],
  TRAFFIC_SIGN: [
    "ป้ายหยุด (STOP)",
    "ป้ายให้ทาง (YIELD)",
    "ป้ายจำกัดความเร็ว 30 กม./ชม.",
    "ป้ายจำกัดความเร็ว 40 กม./ชม.",
    "ป้ายห้ามแซง",
    "ป้ายห้ามจอด",
    "ป้ายเตือนทางโค้ง",
    "ป้ายเตือนทางข้าม",
    "ป้ายชื่อถนน",
  ],
  CCTV: [
    "กล้อง IP Camera 2MP",
    "กล้อง IP Camera 4MP",
    "กล้อง IP Camera 8MP (4K)",
    "กล้อง Bullet ภายนอก",
    "กล้อง Dome ภายใน",
    "กล้อง PTZ ควบคุมระยะไกล",
  ],
  OTHER: ["สัญญาณไฟกระพริบ", "ไฟสัญญาณจราจร", "เสาหลักไมล์", "กระจกโค้ง"],
};

const EMPTY_FORM = {
  type: "STREETLIGHT" as Fixture["type"],
  detail: "",
  lat: "",
  lng: "",
  status: "NORMAL" as Fixture["status"],
  note: "",
};

export default function FixtureManager({ assetId, assetName, roadPath = [] }: FixtureManagerProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pickedLocation, setPickedLocation] = useState<LatLng | null>(null);

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/gis/roads/${assetId}/fixtures`);
    if (res.ok) setFixtures(await res.json());
    setLoading(false);
  }, [assetId]);

  useEffect(() => { fetchFixtures(); }, [fetchFixtures]);

  // เมื่อคลิกเลือกพิกัดบนแผนที่
  const handlePickLocation = (latlng: LatLng) => {
    setPickedLocation(latlng);
    setForm((f) => ({
      ...f,
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
    }));
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setPickedLocation(null);
    setMessage(null);
    setShowForm(true);
  };

  const openEdit = (f: Fixture) => {
    setEditId(f.id);
    setForm({
      type: f.type,
      detail: f.detail || "",
      lat: String(f.lat),
      lng: String(f.lng),
      status: f.status,
      note: f.note || "",
    });
    setPickedLocation({ lat: f.lat, lng: f.lng });
    setMessage(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันลบสิ่งติดตั้งนี้?")) return;
    await fetch(`/api/gis/roads/${assetId}/fixtures/${id}`, { method: "DELETE" });
    setMessage({ type: "ok", text: "ลบสำเร็จ" });
    fetchFixtures();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      setMessage({ type: "err", text: "กรุณาเลือกพิกัดบนแผนที่ หรือกรอก lat/lng" });
      return;
    }
    setSaving(true);
    setMessage(null);

    const url = editId
      ? `/api/gis/roads/${assetId}/fixtures/${editId}`
      : `/api/gis/roads/${assetId}/fixtures`;
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setMessage({ type: "ok", text: editId ? "แก้ไขสำเร็จ" : "เพิ่มสิ่งติดตั้งสำเร็จ" });
      setShowForm(false);
      setEditId(null);
      fetchFixtures();
    } else {
      const err = await res.json();
      setMessage({ type: "err", text: err.error || "เกิดข้อผิดพลาด" });
    }
  };

  const fixtureMarkers: FixtureMarker[] = fixtures.map((f) => ({
    id: f.id,
    lat: f.lat,
    lng: f.lng,
    type: f.type,
    detail: f.detail,
    status: f.status,
  }));

  const typeLabel = (t: string) => FIXTURE_TYPES.find((x) => x.value === t)?.label ?? t;
  const statusLabel = (s: string) => FIXTURE_STATUS.find((x) => x.value === s)?.label ?? s;

  return (
    <section style={{ marginTop: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            🗺️ สิ่งติดตั้งบนถนน
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            เสาไฟฟ้า / ป้ายจราจร / กล้อง CCTV ในถนน {assetName}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn btn-success"
          style={{ gap: 6 }}
        >
          + เพิ่มสิ่งติดตั้ง
        </button>
      </div>

      {/* แผนที่แสดง fixtures */}
      <div style={{ marginBottom: 20 }}>
        <RoadMap
          path={roadPath}
          fixtures={fixtureMarkers}
          height="320px"
          center={
            fixtureMarkers.length > 0
              ? { lat: fixtureMarkers[0].lat, lng: fixtureMarkers[0].lng }
              : roadPath.length > 0 ? roadPath[0] : undefined
          }
        />
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            marginBottom: 14,
            background: message.type === "ok" ? "var(--green-soft, #dcfce7)" : "var(--red-soft, #fee2e2)",
            color: message.type === "ok" ? "var(--green, #16a34a)" : "var(--red, #dc2626)",
            fontSize: 13,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Form เพิ่ม/แก้ไข */}
      {showForm && (
        <div
          style={{
            background: "var(--bg-card, #fff)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              {editId ? "✏️ แก้ไขสิ่งติดตั้ง" : "➕ เพิ่มสิ่งติดตั้งใหม่"}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}
            >✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {/* ประเภท */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "var(--text-secondary)" }}>
                  ประเภท *
                </label>
                <select
                  className="form-input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Fixture["type"], detail: "" })}
                  required
                >
                  {FIXTURE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* รายละเอียด */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "var(--text-secondary)" }}>
                  รายละเอียด/วัสดุ
                </label>
                <select
                  className="form-input"
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                >
                  <option value="">เลือกรายการ (หรือพิมพ์เอง)</option>
                  {(DETAIL_OPTIONS[form.type] || []).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* สถานะ */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "var(--text-secondary)" }}>
                  สถานะ
                </label>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Fixture["status"] })}
                >
                  {FIXTURE_STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* หมายเหตุ */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "var(--text-secondary)" }}>
                  หมายเหตุ
                </label>
                <input
                  className="form-input"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="เช่น ติดตั้งปี 2567"
                />
              </div>
            </div>

            {/* พิกัด */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                📍 พิกัดตำแหน่ง * — คลิกบนแผนที่ด้านล่างเพื่อเลือก
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input
                  className="form-input"
                  placeholder="Latitude"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  type="number"
                  step="any"
                />
                <input
                  className="form-input"
                  placeholder="Longitude"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  type="number"
                  step="any"
                />
              </div>
              <RoadMap
                path={roadPath}
                fixtures={fixtureMarkers}
                pickMode={true}
                onPickLocation={handlePickLocation}
                pickedLocation={pickedLocation}
                height="280px"
                center={
                  pickedLocation ||
                  (roadPath.length > 0 ? roadPath[0] : undefined)
                }
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="btn btn-ghost"
              >
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className="btn btn-success">
                {saving ? "กำลังบันทึก..." : editId ? "บันทึกการแก้ไข" : "เพิ่มสิ่งติดตั้ง"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ตารางแสดง fixtures */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>กำลังโหลด...</div>
      ) : fixtures.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 20px",
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
          <div style={{ fontSize: 14 }}>ยังไม่มีสิ่งติดตั้งบนถนนสายนี้</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>กดปุ่ม "เพิ่มสิ่งติดตั้ง" เพื่อเริ่มต้น</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-hover)", textAlign: "left" }}>
                {["ประเภท", "รายละเอียด", "พิกัด", "สถานะ", "หมายเหตุ", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px" }}>{typeLabel(f.type)}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{f.detail || "—"}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                    {f.lat.toFixed(5)}, {f.lng.toFixed(5)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{statusLabel(f.status)}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{f.note || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(f)} className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}>แก้ไข</button>
                      <button onClick={() => handleDelete(f.id)} className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px", color: "var(--red)" }}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--text-muted)" }}>
            รวม {fixtures.length} รายการ
          </div>
        </div>
      )}
    </section>
  );
}
