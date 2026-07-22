'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapContainer to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Map...</div> }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface PublicWebMapProps {
  center?: [number, number];
  zoom?: number;
}

export default function PublicWebMap({ center = [14.1234, 100.5678], zoom = 13 }: PublicWebMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Fix Leaflet marker icons in Next.js
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-inner border border-white/10 z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Mock Point from QField/QGIS */}
        <Marker position={center}>
          <Popup>
            <div className="text-sm">
              <strong className="text-amber-600 block mb-1">จุดกำลังดำเนินการซ่อมบำรุง</strong>
              รหัส: RP2568-0042<br />
              ประเภท: ถนนชำรุด
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Floating Panel for Public */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 z-[1000] max-w-xs">
        <h4 className="font-bold text-slate-800 text-sm mb-2">ข้อมูลพื้นที่ (Public)</h4>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-amber-500" />
            <span>จุดซ่อมบำรุง (e-Service)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-blue-500" />
            <span>แนวเขตผังเมืองรวม</span>
          </label>
        </div>
      </div>
    </div>
  );
}
