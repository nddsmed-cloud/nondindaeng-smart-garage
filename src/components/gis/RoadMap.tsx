"use client";
// src/components/gis/RoadMap.tsx
// Leaflet map สำหรับแสดงถนนและ fixtures
// ใช้ dynamic import เพื่อหลีกเลี่ยง SSR errors

import { useEffect, useRef } from "react";

export type LatLng = { lat: number; lng: number };

export type FixtureMarker = {
  id: string;
  lat: number;
  lng: number;
  type: "STREETLIGHT" | "TRAFFIC_SIGN" | "CCTV" | "OTHER";
  detail?: string | null;
  status: "NORMAL" | "UNDER_REPAIR" | "DAMAGED";
};

type RoadMapProps = {
  center?: LatLng;
  zoom?: number;
  path?: LatLng[];
  fixtures?: FixtureMarker[];
  pickMode?: boolean; // true = คลิกแผนที่เพื่อเลือกพิกัด
  onPickLocation?: (latlng: LatLng) => void;
  pickedLocation?: LatLng | null;
  height?: string;
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

export default function RoadMap({
  center = { lat: 14.3256, lng: 102.8012 }, // โนนดินแดง บึงกาฬ (default)
  zoom = 14,
  path = [],
  fixtures = [],
  pickMode = false,
  onPickLocation,
  pickedLocation,
  height = "400px",
}: RoadMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pickedMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // Guard: ถ้า Leaflet เริ่มต้น instance แล้ว ให้ข้ามไป
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;
    if (mapInstanceRef.current) return;

    // Dynamic import leaflet (client-side only)
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;

      // Fix default icon URLs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(
        [center.lat, center.lng],
        zoom
      );
      mapInstanceRef.current = map;

      // Tile layer — OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
        maxZoom: 19,
      }).addTo(map);

      // Draw path (polyline)
      if (path.length >= 2) {
        const latlngs = path.map((p) => [p.lat, p.lng] as [number, number]);
        pathLayerRef.current = L.polyline(latlngs, {
          color: "#3b82f6",
          weight: 5,
          opacity: 0.85,
        }).addTo(map);
        map.fitBounds(pathLayerRef.current.getBounds(), { padding: [20, 20] });
      }

      // Draw fixture markers
      fixtures.forEach((f) => {
        const icon = FIXTURE_ICONS[f.type] || "📌";
        const color = STATUS_COLORS[f.status] || "#22c55e";
        const divIcon = L.divIcon({
          html: `<div style="
            background:${color};width:32px;height:32px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:16px;border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
          ">${icon}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: "",
        });
        const marker = L.marker([f.lat, f.lng], { icon: divIcon })
          .addTo(map)
          .bindPopup(
            `<b>${icon} ${f.type === "STREETLIGHT" ? "เสาไฟฟ้า" : f.type === "TRAFFIC_SIGN" ? "ป้ายจราจร" : f.type === "CCTV" ? "กล้อง CCTV" : "อื่นๆ"}</b><br/>${f.detail || ""}<br/>สถานะ: ${f.status === "NORMAL" ? "ปกติ" : f.status === "UNDER_REPAIR" ? "ซ่อม" : "ชำรุด"}`
          );
        markersRef.current.push(marker);
      });

      // Pick mode — click to select location
      if (pickMode && onPickLocation) {
        map.getContainer().style.cursor = "crosshair";
        map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
          onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update picked location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (pickedMarkerRef.current) {
        pickedMarkerRef.current.remove();
        pickedMarkerRef.current = null;
      }
      if (pickedLocation) {
        const divIcon = L.divIcon({
          html: `<div style="
            background:#ef4444;width:28px;height:28px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          ">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: "",
        });
        pickedMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
          icon: divIcon,
        }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.setView([pickedLocation.lat, pickedLocation.lng], 16);
      }
    });
  }, [pickedLocation]);

  return (
    <div style={{ position: "relative" }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={mapRef}
        style={{
          height,
          width: "100%",
          borderRadius: "var(--radius-md, 10px)",
          overflow: "hidden",
          border: "1px solid var(--border, #e2e8f0)",
        }}
      />
      {pickMode && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          📍 คลิกบนแผนที่เพื่อเลือกพิกัด
        </div>
      )}
    </div>
  );
}
