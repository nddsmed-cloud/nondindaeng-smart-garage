"use client";
// src/app/gis/map/GISMapView.tsx
// Client component สำหรับแสดงแผนที่ GIS ทั้งหมด (Leaflet)

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Fixture = {
  id: string;
  type: string;
  detail: string | null;
  lat: number;
  lng: number;
  status: string;
};

type Road = {
  id: string;
  name: string;
  path: { lat: number; lng: number }[];
  registration: {
    routeCode: string | null;
    lengthKm: number | null;
    surfaceType: string | null;
  } | null;
  fixtures: Fixture[];
};

const FIXTURE_ICONS: Record<string, string> = {
  STREETLIGHT: "💡",
  TRAFFIC_SIGN: "🚦",
  CCTV: "📷",
  OTHER: "📌",
};

const STATUS_COLORS: Record<string, string> = {
  NORMAL: "#22c55e",
  UNDER_REPAIR: "#f59e0b",
  DAMAGED: "#ef4444",
};

const SURFACE_COLORS: Record<string, string> = {
  ASPHALT: "#1d4ed8",
  CONCRETE: "#6b7280",
  LATERITE: "#d97706",
  GRAVEL: "#92400e",
  EARTH: "#166534",
};

const SURFACE_LABELS: Record<string, string> = {
  ASPHALT: "ลาดยาง",
  CONCRETE: "คอนกรีต",
  LATERITE: "ลูกรัง",
  GRAVEL: "หินคลุก",
  EARTH: "ดิน",
};

const DETAIL_OPTIONS: Record<string, { group: string; items: string[] }[]> = {
  STREETLIGHT: [
    { group: "โคมไฟถนน LED", items: ["โคมไฟถนน LED 60 W (มอก.)", "โคมไฟถนน LED 90 W", "โคมไฟถนน LED 120 W", "โคมไฟถนน LED 150 W"] },
    { group: "โคมไฟถนน Solar Cell", items: ["โคมไฟ Solar Cell 60-100 W All-in-One", "โคมไฟ Solar Cell 120-200 W Split Type"] },
    { group: "โคมไฟฟลัดไลท์", items: ["โคมไฟฟลัดไลท์ LED 50 W", "โคมไฟฟลัดไลท์ LED 100 W", "โคมไฟฟลัดไลท์ LED 200 W", "โคมไฟฟลัดไลท์ LED 400 W"] },
    { group: "หลอดไฟและอื่นๆ", items: ["หลอดไฟ LED Bulb 20 W", "หลอดไฟ LED Tube T8 18 W", "หลอดไฟ LED Tube T8 9 W", "Photo Switch 3A/6A/10A", "ตู้ควบคุมไฟถนน"] },
  ],
  TRAFFIC_SIGN: [
    { group: "ป้ายเตือน/บังคับ", items: ["ป้ายหยุด", "ป้ายให้ทาง", "ป้ายห้ามเข้า", "ป้ายจำกัดความเร็ว 30/50/80 กม./ชม.", "ป้ายเตือนทางโค้ง/ทางแยก"] },
    { group: "อุปกรณ์จราจร", items: ["กระจกโค้งจราจร", "หมุดถนนสะท้อนแสง", "แผงกั้นจราจร", "เสาล้มลุก"] },
  ],
  CCTV: [
    { group: "กล้องวงจรปิด", items: ["กล้อง IP Camera 2 MP", "กล้อง IP Camera 4 MP", "กล้อง IP Camera 8 MP", "กล้อง PTZ 2 MP/4 MP"] },
    { group: "อุปกรณ์เครือข่าย", items: ["เครื่องบันทึก NVR", "PoE Switch"] },
  ],
  OTHER: [],
};

export default function GISMapView({ roads }: { roads: Road[] }) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [showFixtures, setShowFixtures] = useState(true);
  const [showPaths, setShowPaths] = useState(true);

  // Pick Mode States
  const [pickMode, setPickMode] = useState(false);
  const pickModeRef = useRef(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    roadId: "",
    type: "STREETLIGHT",
    detail: "",
    status: "NORMAL",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Sync ref with state for Leaflet event listener
  useEffect(() => {
    pickModeRef.current = pickMode;
  }, [pickMode]);

  const totalFixtures = roads.reduce((s, r) => s + r.fixtures.length, 0);

  useEffect(() => {
    if (!mapRef.current) return;
    // Guard: ป้องกัน React StrictMode เรียก useEffect 2 ครั้ง
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(
        [14.3256, 102.8012], 13
      );
      mapInstanceRef.current = map;

      // Google Satellite (Hybrid) with Thai labels
      L.tileLayer("https://mt1.google.com/vt/lyrs=y&hl=th&x={x}&y={y}&z={z}", {
        attribution: "© Google",
        maxZoom: 20,
      }).addTo(map);

      const allBounds: [number, number][] = [];

      roads.forEach((road) => {
        // Draw polyline
        if (road.path.length >= 2) {
          const latlngs = road.path.map((p) => [p.lat, p.lng] as [number, number]);
          latlngs.forEach((ll) => allBounds.push(ll));
          const color = road.registration?.surfaceType
            ? SURFACE_COLORS[road.registration.surfaceType] || "#3b82f6"
            : "#3b82f6";
          L.polyline(latlngs, { color, weight: 5, opacity: 0.85 })
            .addTo(map)
            .bindPopup(
              `<b>${road.name}</b><br/>รหัส: ${road.registration?.routeCode || "—"}<br/>` +
              `ระยะทาง: ${road.registration?.lengthKm ? road.registration.lengthKm + " กม." : "—"}<br/>` +
              `<a href="/gis/roads/${road.id}" style="color:#3b82f6">ดูรายละเอียด →</a>`
            );
        }

        // Draw fixture markers
        road.fixtures.forEach((f) => {
          allBounds.push([f.lat, f.lng]);
          const icon = FIXTURE_ICONS[f.type] || "📌";
          const color = STATUS_COLORS[f.status] || "#22c55e";
          const divIcon = L.divIcon({
            html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${icon}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            className: "",
          });
          L.marker([f.lat, f.lng], { icon: divIcon }).addTo(map).bindPopup(
            `<b>${icon} ${f.type}</b><br/>${f.detail || ""}<br/>ถนน: ${road.name}`
          );
        });
      });

      if (allBounds.length > 0) {
        map.fitBounds(allBounds, { padding: [30, 30] });
      }

      // Map Click Event for Pick Mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => {
        if (!pickModeRef.current) return;
        setPickedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowModal(true);
        setPickMode(false);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit New Fixture
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roadId || !pickedLocation) return;
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/gis/roads/${form.roadId}/fixtures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        detail: form.detail,
        lat: pickedLocation.lat,
        lng: pickedLocation.lng,
        status: form.status,
        note: form.note,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setMessage({ type: "ok", text: "เพิ่มสิ่งติดตั้งสำเร็จ!" });
      setTimeout(() => {
        setShowModal(false);
        setMessage(null);
        setForm({ roadId: "", type: "STREETLIGHT", detail: "", status: "NORMAL", note: "" });
        router.refresh();
      }, 1500);
    } else {
      const err = await res.json();
      setMessage({ type: "err", text: err.error || "เกิดข้อผิดพลาด" });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "err", text: "เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด (GPS)" });
      return;
    }
    setMessage({ type: "ok", text: "กำลังดึงพิกัด GPS..." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickedLocation({
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
        });
        setMessage({ type: "ok", text: "ดึงพิกัดสำเร็จ" });
        if (!showModal) setShowModal(true); // Open modal if not open
      },
      (error) => {
        console.error("Geolocation error:", error);
        setMessage({ type: "err", text: "ไม่สามารถดึงพิกัดได้ กรุณาเปิด GPS และอนุญาตการเข้าถึงตำแหน่ง" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Lists for dropdown
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start", position: "relative" }}>
      {/* Sidebar */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {/* Stats */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-hover)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              📊 สรุปแผนที่
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleGetLocation}
                className="btn btn-primary"
                style={{ fontSize: 11, padding: "4px 8px", background: "#3b82f6", color: "#fff", border: "none" }}
              >
                📍 ดึงพิกัด (GPS)
              </button>
              <button
                onClick={() => setPickMode(!pickMode)}
                className="btn btn-success"
                style={{ fontSize: 11, padding: "4px 8px" }}
              >
                {pickMode ? "ยกเลิกปักหมุด" : "+ ปักหมุด"}
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "ถนน", value: roads.length, unit: "สาย" },
              { label: "สิ่งติดตั้ง", value: totalFixtures, unit: "รายการ" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg-card)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label} ({s.unit})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>สัญลักษณ์</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { icon: "💡", label: "เสาไฟฟ้า", color: "#22c55e" },
              { icon: "🚦", label: "ป้ายจราจร", color: "#22c55e" },
              { icon: "📷", label: "กล้อง CCTV", color: "#22c55e" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              🟢 ปกติ &nbsp; 🟡 ซ่อม &nbsp; 🔴 ชำรุด
            </div>
          </div>
        </div>

        {/* Roads List */}
        <div style={{ padding: "12px 0" }}>
          <div style={{ padding: "0 16px 8px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
            รายการถนน
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {roads.length === 0 ? (
              <div style={{ padding: "16px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                ยังไม่มีถนนในระบบ
              </div>
            ) : roads.map((road) => (
              <div
                key={road.id}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  background: selectedRoad?.id === road.id ? "var(--primary-soft, #eff6ff)" : "transparent",
                  borderLeft: selectedRoad?.id === road.id ? "3px solid var(--primary, #3b82f6)" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
                onClick={() => setSelectedRoad(road === selectedRoad ? null : road)}
                onMouseEnter={(e) => { if (selectedRoad?.id !== road.id) (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { if (selectedRoad?.id !== road.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{road.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {road.registration?.surfaceType && (
                    <span style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 10,
                      background: `${SURFACE_COLORS[road.registration.surfaceType] || "#6b7280"}18`,
                      color: SURFACE_COLORS[road.registration.surfaceType] || "#6b7280",
                    }}>
                      {SURFACE_LABELS[road.registration.surfaceType] || road.registration.surfaceType}
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    🗺️ {road.fixtures.length} สิ่งติดตั้ง
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick link */}
        {selectedRoad && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
            <Link
              href={`/gis/roads/${selectedRoad.id}`}
              className="btn btn-success"
              style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
            >
              ดูรายละเอียด ทถ.3 →
            </Link>
          </div>
        )}
      </div>

      {/* Map */}
      <div>
        {pickMode && (
          <div style={{
            background: "var(--blue)", color: "white", padding: "8px 16px",
            borderRadius: "var(--radius-sm)", marginBottom: 12, fontSize: 13, fontWeight: 600,
            display: "inline-block"
          }}>
            🎯 คลิกบริเวณที่ต้องการปักหมุดบนแผนที่
          </div>
        )}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <div
          ref={mapRef}
          style={{
            height: "calc(100vh - 200px)",
            minHeight: 500,
            width: "100%",
            borderRadius: "var(--radius-md)",
            border: pickMode ? "2px dashed var(--blue)" : "1px solid var(--border)",
            cursor: pickMode ? "crosshair" : "default",
            overflow: "hidden",
          }}
        />
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>
          แผนที่: © OpenStreetMap contributors
        </div>
      </div>

      {/* Fixture Modal */}
      {showModal && pickedLocation && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-card)", padding: 24, borderRadius: "var(--radius-md)",
            width: "100%", maxWidth: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>📍 เพิ่มสิ่งติดตั้งใหม่</h3>
            <div style={{ marginBottom: 16, fontSize: 13, color: "var(--blue)", background: "var(--blue-soft)", padding: 8, borderRadius: 6 }}>
              พิกัด: {pickedLocation.lat}, {pickedLocation.lng}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>ถนนที่เกี่ยวข้อง *</label>
                <select className="form-input" required value={form.roadId} onChange={e => setForm({...form, roadId: e.target.value})}>
                  <option value="">-- เลือกถนน --</option>
                  {roads.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>ประเภท *</label>
                <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {FIXTURE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>รายละเอียด</label>
                {DETAIL_OPTIONS[form.type]?.length > 0 ? (
                  <select className="form-input" value={form.detail} onChange={e => setForm({...form, detail: e.target.value})}>
                    <option value="">-- เลือกรายการ --</option>
                    {DETAIL_OPTIONS[form.type].map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.items.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <input className="form-input" placeholder="ระบุรายละเอียด..." value={form.detail} onChange={e => setForm({...form, detail: e.target.value})} />
                )}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>สถานะ</label>
                <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {FIXTURE_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>หมายเหตุ</label>
                <input className="form-input" placeholder="พิมพ์หมายเหตุเพิ่มเติม..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
              
              {message && (
                <div style={{ marginBottom: 16, padding: 10, borderRadius: 6, fontSize: 13,
                  background: message.type === "ok" ? "var(--green-soft)" : "var(--red-soft)",
                  color: message.type === "ok" ? "var(--green)" : "var(--red)" }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-success" disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
