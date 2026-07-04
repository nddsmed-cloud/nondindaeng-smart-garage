// src/app/gis/map/page.tsx
// แผนที่ GIS — แสดงถนนและ fixtures ทั้งหมดบน Leaflet

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GISMapView from "./GISMapView";

export const metadata = {
  title: "แผนที่ GIS | GIS กองช่าง",
};

async function getAllRoadsForMap() {
  const roads = await prisma.infraAsset.findMany({
    include: {
      registration: true,
      fixtures: true,
    },
  });
  return roads;
}

export default async function GISMapPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const roads = await getAllRoadsForMap();

  // Serialize for client
  const roadsData = roads.map((r) => ({
    id: r.id,
    name: r.name,
    path: Array.isArray(r.path) ? (r.path as { lat: number; lng: number }[]) : [],
    registration: r.registration
      ? {
          routeCode: r.registration.routeCode,
          lengthKm: r.registration.lengthKm,
          surfaceType: r.registration.surfaceType,
        }
      : null,
    fixtures: r.fixtures.map((f) => ({
      id: f.id,
      type: f.type,
      detail: f.detail,
      lat: f.lat,
      lng: f.lng,
      status: f.status,
    })),
  }));

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
          📍 แผนที่ GIS + สิ่งติดตั้ง
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          แสดงถนนทั้งหมด {roads.length} สาย และสิ่งติดตั้งบนแผนที่ OpenStreetMap
        </p>
      </div>
      <GISMapView roads={roadsData} />
    </div>
  );
}
