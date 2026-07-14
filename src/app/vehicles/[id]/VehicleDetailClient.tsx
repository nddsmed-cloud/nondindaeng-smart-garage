"use client";

import { useState } from "react";
import Link from "next/link";
import { formatThaiDate } from "../../../lib/date-formatter";

type Vehicle = any;
type TripLog = any;
type FuelLog = any;

export default function VehicleDetailClient({
  vehicle,
  tripLogs,
  fuelLogs,
  role,
}: {
  vehicle: Vehicle;
  tripLogs: TripLog[];
  fuelLogs: FuelLog[];
  role: string;
}) {
  const [activeTab, setActiveTab] = useState<"info" | "fuel" | "trips">("info");

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl font-extrabold text-teal-800 flex items-center gap-2">
            🚗 {vehicle.licensePlate} {vehicle.province}
          </h1>
          <p className="page-subtitle text-slate-500 mt-2 flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase">
              {vehicle.brand}
            </span>
            <span>{vehicle.model} — {vehicle.bodyType}</span>
            <span className="text-slate-400">| ID: {vehicle.id.slice(0, 8)}</span>
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 text-sm">
              {vehicle.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {role === "ADMIN" || role === "MANAGER" || role === "OFFICER" ? (
              <Link href={`/vehicles/${vehicle.id}/maintenance-docs`} className="btn bg-indigo-600 text-white text-sm py-1.5 px-3 hover:bg-indigo-700 shadow-sm">
                🛠️ ออกเอกสารซ่อมบำรุง
              </Link>
            ) : null}
            {role === "ADMIN" && (
              <Link href={`/vehicles/${vehicle.id}/edit`} className="btn btn-warning text-sm py-1.5 px-3 shadow-sm">
                ✏️ แก้ไขข้อมูลรถ
              </Link>
            )}
            <Link href="/vehicles" className="btn btn-ghost text-sm py-1.5 px-3">
              ← กลับ
            </Link>
          </div>
        </div>
      </div>

      <div className="card max-w-6xl mx-auto mt-6">
        {/* แถบเมนู (Tabs Navigation) */}
        <div className="flex border-b border-slate-200 mb-6 bg-slate-50 rounded-t-lg p-1.5 gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === "info" ? "bg-white text-teal-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            📋 รายการจดทะเบียน (คส.1)
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === "trips" ? "bg-white text-teal-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            🚗 ประวัติการใช้รถ
          </button>
          <button
            onClick={() => setActiveTab("fuel")}
            className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === "fuel" ? "bg-white text-teal-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            ⛽ ประวัติการเติมน้ำมัน
          </button>
        </div>

        {/* พื้นที่แสดงเนื้อหาตามแถบที่เลือก (Tab Panels) */}
        <div className="p-2">
          
          {/* TAB 1: รายการจดทะเบียน (PRO DESIGN) */}
          {activeTab === "info" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left: Image & Main ID */}
                <div className="w-full lg:w-1/3 space-y-4">
                  {/* Image Card */}
                  <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-md group bg-slate-200">
                    <img 
                      src={`https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800`} 
                      alt="Vehicle Photo" 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-white/20 shadow-sm">
                        📸 ภาพถ่ายล่าสุด
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm">
                          {vehicle.vehicleType}
                        </span>
                        <span className="bg-slate-700/80 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm border border-slate-600">
                          สี{vehicle.color}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-wide drop-shadow-md">
                        {vehicle.licensePlate}
                      </h3>
                      <p className="text-slate-300 text-sm font-medium mt-1 drop-shadow">{vehicle.province}</p>
                    </div>
                  </div>
                  
                  {/* Acquisition Info */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-lg border border-slate-700 flex justify-between items-center text-white">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">มูลค่าทรัพย์สิน (ได้มา)</p>
                      <p className="text-xl font-black text-emerald-400">
                        {vehicle.acquiredPrice ? `฿${vehicle.acquiredPrice.toLocaleString("th-TH")}` : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">วันจดทะเบียน</p>
                      <p className="text-sm font-semibold text-slate-200">{formatThaiDate(vehicle.registeredDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Details (Game-like UI) */}
                <div className="w-full lg:w-2/3 space-y-8 py-2">
                  
                  {/* Core Specs */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                      <span className="w-8 h-px bg-slate-300"></span>
                      Core Specifications
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-3xl mb-2 relative z-10">🚀</span>
                        <span className="text-xs text-slate-500 font-semibold relative z-10">ความจุเครื่องยนต์</span>
                        <span className="text-xl font-black text-slate-800 relative z-10 tracking-tight mt-1">{vehicle.engineCapacity?.toLocaleString()} <span className="text-xs font-bold text-slate-400">CC</span></span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-3xl mb-2 relative z-10">⚖️</span>
                        <span className="text-xs text-slate-500 font-semibold relative z-10">น้ำหนักรวม</span>
                        <span className="text-xl font-black text-slate-800 relative z-10 tracking-tight mt-1">{vehicle.totalWeight?.toLocaleString()} <span className="text-xs font-bold text-slate-400">KG</span></span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-3xl mb-2 relative z-10">⛽</span>
                        <span className="text-xs text-slate-500 font-semibold relative z-10">เชื้อเพลิง</span>
                        <span className="text-lg font-black text-slate-800 relative z-10 tracking-tight mt-1">{vehicle.fuelType}</span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-3xl mb-2 relative z-10">🏷️</span>
                        <span className="text-xs text-slate-500 font-semibold relative z-10">เลขครุภัณฑ์</span>
                        <span className="text-sm font-bold text-slate-800 relative z-10 tracking-tight mt-1 break-all">{vehicle.assetNumber || "-"}</span>
                      </div>

                    </div>
                  </div>

                  {/* Detailed Engineering Data */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                      <span className="w-8 h-px bg-slate-300"></span>
                      Engineering Data
                    </h4>
                    <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                        
                        <div className="flex justify-between items-end border-b border-slate-200/80 border-dashed pb-2">
                          <span className="text-slate-500 text-sm font-medium">เลขตัวรถ (Chassis)</span>
                          <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{vehicle.chassisNumber}</span>
                        </div>
                        
                        <div className="flex justify-between items-end border-b border-slate-200/80 border-dashed pb-2">
                          <span className="text-slate-500 text-sm font-medium">เลขเครื่องยนต์ (Engine)</span>
                          <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{vehicle.engineNumber}</span>
                        </div>

                        <div className="flex justify-between items-end border-b border-slate-200/80 border-dashed pb-2">
                          <span className="text-slate-500 text-sm font-medium">ลักษณะรถ (Body Type)</span>
                          <span className="font-bold text-slate-800">{vehicle.bodyType}</span>
                        </div>

                        <div className="flex justify-between items-end border-b border-slate-200/80 border-dashed pb-2">
                          <span className="text-slate-500 text-sm font-medium">ยี่ห้อ (Brand)</span>
                          <span className="font-bold text-slate-800">{vehicle.brand}</span>
                        </div>
                        
                        <div className="flex justify-between items-end border-b border-slate-200/80 border-dashed pb-2 md:col-span-2 mt-2">
                          <span className="text-slate-500 text-sm font-medium">น้ำหนัก: รถเปล่า / บรรทุก / รวม</span>
                          <span className="font-bold text-slate-800 tracking-wide">
                            {vehicle.emptyWeight?.toLocaleString()} <span className="text-slate-400 font-normal">/</span> {vehicle.payloadWeight?.toLocaleString()} <span className="text-slate-400 font-normal">/</span> {vehicle.totalWeight?.toLocaleString()} <span className="text-xs text-slate-500">กก.</span>
                          </span>
                        </div>
                        
                        {/* Fake Game-like Stat bar for visual flair */}
                        <div className="md:col-span-2 pt-2">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Payload Ratio</span>
                            <span className="text-blue-600 font-black">{Math.round((vehicle.payloadWeight / vehicle.totalWeight) * 100) || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full relative" style={{ width: `${Math.round((vehicle.payloadWeight / vehicle.totalWeight) * 100) || 0}%` }}>
                              <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ประวัติการใช้รถ */}
          {activeTab === "trips" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-teal-800 mb-4 pb-2 border-b flex items-center gap-2">
                <span>🛣️</span> ประวัติการใช้รถยนต์ส่วนกลาง
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm font-bold border-b border-slate-200">
                      <th className="p-4">วันที่เดินทาง</th>
                      <th className="p-4">คนขับ / ผู้ขอ</th>
                      <th className="p-4">จุดหมาย</th>
                      <th className="p-4">ระยะทาง</th>
                      <th className="p-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y text-slate-600">
                    {tripLogs.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500 bg-slate-50">ไม่มีข้อมูลการเดินทาง</td></tr>
                    ) : (
                      tripLogs.map((trip) => (
                        <tr key={trip.id} className="hover:bg-teal-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap">{formatThaiDate(trip.travelDate)}</td>
                          <td className="p-4 font-semibold text-slate-800">{trip.driverName}</td>
                          <td className="p-4">{trip.destination}</td>
                          <td className="p-4 font-medium">{trip.distance} กม.</td>
                          <td className="p-4 text-center">
                            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                              {trip.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ประวัติการเติมน้ำมัน */}
          {activeTab === "fuel" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-teal-800 mb-4 pb-2 border-b flex items-center gap-2">
                <span>⛽</span> ประวัติการเติมน้ำมัน
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm font-bold border-b border-slate-200">
                      <th className="p-4">วันที่เติม</th>
                      <th className="p-4">จำนวนลิตร</th>
                      <th className="p-4">ราคา/ลิตร</th>
                      <th className="p-4 text-right">ยอดรวม (บาท)</th>
                      <th className="p-4">สถานี/สถานที่</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y text-slate-600">
                    {fuelLogs.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500 bg-slate-50">ไม่มีข้อมูลการเติมน้ำมัน</td></tr>
                    ) : (
                      fuelLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap">{formatThaiDate(log.fuelDate)}</td>
                          <td className="p-4 font-medium">{log.liters.toFixed(2)}</td>
                          <td className="p-4">{log.pricePerLiter.toFixed(2)}</td>
                          <td className="p-4 text-amber-700 font-bold text-right">{log.totalCost.toLocaleString()}.-</td>
                          <td className="p-4">{log.fuelStation || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
