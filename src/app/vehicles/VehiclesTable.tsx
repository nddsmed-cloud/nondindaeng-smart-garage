"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteVehicle } from "./vehicle-actions";

type Vehicle = {
  id: string;
  licensePlate: string;
  province: string;
  vehicleType: string;
  bodyType: string;
  brand: string;
  model: string;
  color: string;
  fuelType: string;
  engineCapacity?: number;
  registeredDate?: Date | string;
  acquiredPrice?: number;
  status: string;
};

export default function VehiclesTable({ vehicles, role }: { vehicles: Vehicle[], role: string }) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showQRFor, setShowQRFor] = useState<string | null>(null);

  const filtered = vehicles.filter((v) =>
    [v.licensePlate, v.brand, v.model, v.vehicleType, v.status]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      "พร้อมใช้งาน": "bg-emerald-100 text-emerald-800 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-600 transition-colors duration-300",
      "ส่งซ่อม": "bg-amber-100 text-amber-800 border-amber-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-600 transition-colors duration-300",
      "ยกเลิกใช้งาน": "bg-rose-100 text-rose-800 border-rose-200 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-600 transition-colors duration-300",
    };
    return map[status] || "bg-blue-100 text-blue-800 border-blue-200 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300";
  };

  const handleDelete = async (id: string, plate: string) => {
    if (!confirm(`ยืนยันการลบรถทะเบียน "${plate}" ออกจากระบบ?`)) return;
    setDeletingId(id);
    await deleteVehicle(id);
    setDeletingId(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            placeholder="ค้นหาทะเบียน, ยี่ห้อ, ประเภทรถ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          พบ {filtered.length} จาก {vehicles.length} รายการ
        </div>
      </div>

      {/* Grid Layout for Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
          <span className="text-6xl grayscale opacity-50">🚗</span>
          <h3 className="text-xl font-bold text-slate-600 mt-4">ไม่พบรายการรถยนต์</h3>
          <p className="text-slate-400 mt-2">ลองเปลี่ยนคำค้นหา หรือเพิ่มรถคันใหม่เข้าสู่ระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((vehicle) => {
            // Mock random values for the UI presentation
            const fuelLevel = Math.floor(Math.random() * 60) + 30; // 30-90%
            const condition = Math.floor(Math.random() * 40) + 60; // 60-100%
            const dailyUsage = Math.floor(Math.random() * 100); // 0-100km

            // Extract year if available
            const regYear = vehicle.registeredDate ? new Date(vehicle.registeredDate).getFullYear() + 543 : "-";

            return (
              <div key={vehicle.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group relative">
                
                {/* 1. Image Section */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600&h=400&sig=${vehicle.id}`} 
                    alt={vehicle.licensePlate} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                  
                  {/* Status Badge Over Image */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm backdrop-blur-md ${statusBadge(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>

                  {/* Image Actions */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={() => setShowQRFor(showQRFor === vehicle.id ? null : vehicle.id)}
                      className="bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white p-2 rounded-lg shadow font-bold text-xs flex items-center gap-1 transition-colors"
                      title="สแกน QR Code"
                    >
                      <span>📱</span> QR
                    </button>
                    <button className="bg-teal-600/90 backdrop-blur-sm text-white hover:bg-teal-600 p-2 rounded-lg shadow font-bold text-xs flex items-center gap-1 transition-colors">
                      <span>📷</span> อัปโหลด
                    </button>
                  </div>
                  
                  {/* License Plate Over Image */}
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-xl font-black text-white drop-shadow-md">{vehicle.licensePlate}</h3>
                    <p className="text-xs text-slate-200 font-medium">{vehicle.province}</p>
                  </div>

                  {/* QR Code Overlay Overlay (Conditional) */}
                  {showQRFor === vehicle.id && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in zoom-in duration-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://6-ndd-smart-garage.vercel.app/vehicles/${vehicle.id}`} 
                        alt="QR Code" 
                        className="w-28 h-28 border border-slate-200 p-1 bg-white rounded-lg shadow-sm"
                      />
                      <p className="text-xs font-bold text-slate-600 mt-2">สแกนดูข้อมูลรถ</p>
                      <button 
                        onClick={() => setShowQRFor(null)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  
                  {/* 2. Basic Info Section */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-4">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">ยี่ห้อ / รุ่น</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{vehicle.brand} {vehicle.model}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">ประเภท</span>
                      <span className="font-medium text-slate-700 line-clamp-1">{vehicle.vehicleType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">เครื่องยนต์ / เชื้อเพลิง</span>
                      <span className="font-mono text-slate-700 bg-slate-50 px-1 py-0.5 rounded text-xs">{vehicle.engineCapacity ? `${vehicle.engineCapacity.toLocaleString()}cc` : '-'} {vehicle.fuelType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">ปีจดทะเบียน / ราคา</span>
                      <span className="font-medium text-slate-700">ปี {regYear} / {vehicle.acquiredPrice ? `฿${vehicle.acquiredPrice.toLocaleString()}` : '-'}</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100 my-2"></div>

                  {/* 3. Status Section */}
                  <div className="space-y-3 mt-2 flex-1">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>⛽ ระดับน้ำมัน</span>
                        <span className="text-slate-700">{fuelLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${fuelLevel > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${fuelLevel}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>🔧 สภาพรถ</span>
                        <span className="text-slate-700">{condition}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${condition > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${condition}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>🚗 การใช้งานรายวัน</span>
                        <span className="text-slate-700">{dailyUsage} กม.</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(dailyUsage, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons inside Card */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <Link href={`/vehicles/${vehicle.id}`} className="flex-1 bg-slate-50 hover:bg-teal-50 text-teal-700 text-center py-2 rounded-lg text-sm font-bold border border-slate-200 transition-colors">
                      ดูรายละเอียด
                    </Link>
                    {role === "ADMIN" && (
                      <div className="flex gap-2">
                        <Link href={`/vehicles/${vehicle.id}/edit`} className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm border border-slate-200 transition-colors flex items-center justify-center">
                          ✏️
                        </Link>
                        <button 
                          onClick={() => handleDelete(vehicle.id, vehicle.licensePlate)}
                          disabled={deletingId === vehicle.id}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-lg text-sm border border-rose-200 transition-colors flex items-center justify-center"
                        >
                          {deletingId === vehicle.id ? "⏳" : "🗑"}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
