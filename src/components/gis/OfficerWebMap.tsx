'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

export default function OfficerWebMap() {
  const [isMounted, setIsMounted] = useState(false);
  const center: [number, number] = [14.1234, 100.5678];

  useEffect(() => {
    setIsMounted(true);
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
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 z-0">
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Base Map (Satellite option for officers) */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
        />
        
        {/* Mock Data layer from QGIS Server */}
        <Circle center={center} pathOptions={{ fillColor: 'blue', color: 'blue', fillOpacity: 0.2 }} radius={200}>
          <Popup>เขตระยะร่นอาคาร (จำลอง)</Popup>
        </Circle>

        <Marker position={[14.1250, 100.5690]}>
          <Popup>
            <div className="text-sm">
              <strong className="text-emerald-600">แปลงที่ดิน รหัส: 12345</strong><br/>
              เจ้าของ: นายสมชาย ใจดี<br/>
              สถานะ: ตรวจสอบแนวเขตแล้ว
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Officer Control Panel */}
      <div className="absolute top-4 right-4 bg-slate-900/90 text-white p-4 rounded-xl shadow-xl border border-slate-700 z-[1000] w-64 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <h4 className="font-bold text-sm">GIS Layers (เจ้าหน้าที่)</h4>
        </div>
        
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">ระบบผังเมือง (WMS)</span>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-slate-600 bg-slate-800" />
              <span>แนวเขตการใช้ประโยชน์ที่ดิน</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors">
              <input type="checkbox" className="rounded border-slate-600 bg-slate-800" />
              <span>แปลงที่ดิน สปก. / โฉนด</span>
            </label>
          </div>
          
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">โครงสร้างพื้นฐาน</span>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-slate-600 bg-slate-800" />
              <span>แนวท่อระบายน้ำ กองช่าง</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors">
              <input type="checkbox" className="rounded border-slate-600 bg-slate-800" />
              <span>เสาไฟฟ้าแสงสว่างสาธารณะ</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
