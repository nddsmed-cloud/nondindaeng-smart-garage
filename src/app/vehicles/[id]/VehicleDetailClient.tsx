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
  const [activeTab, setActiveTab] = useState<"info" | "trip" | "fuel">("info");

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in duration-500">
      
      {/* 1. Page Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
            <Link href="/vehicles" className="text-teal-600 hover:text-teal-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            ทะเบียนรถ: {vehicle.licensePlate} {vehicle.province}
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-8">รหัสอ้างอิง: {vehicle.id}</p>
        </div>
        
        {role === "ADMIN" && (
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shadow-sm border border-slate-300 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            แก้ไขข้อมูล
          </Link>
        )}
      </div>

      {/* 2. Hero Section (Image & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Image with Upload Button */}
        <div className="lg:col-span-5 relative group rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 aspect-video lg:aspect-[4/3]">
          <img 
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200" 
            alt="Vehicle" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
          
          <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-teal-800 hover:bg-teal-50 px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 border border-white/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            อัปโหลดภาพล่าสุด
          </button>
        </div>

        {/* Right: Quick Stats & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="card p-6 border-t-4 border-t-teal-500 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">{vehicle.brand} {vehicle.model}</h2>
                <p className="text-slate-500">{vehicle.vehicleType} | {vehicle.bodyType}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${vehicle.status === "พร้อมใช้งาน" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                {vehicle.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 flex-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="block text-xs text-slate-500 mb-1">เชื้อเพลิง</span>
                <span className="font-bold text-slate-800">{vehicle.fuelType}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="block text-xs text-slate-500 mb-1">ขนาดเครื่อง</span>
                <span className="font-bold text-slate-800">{vehicle.engineCapacity?.toLocaleString()} <span className="text-xs font-normal">CC</span></span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="block text-xs text-slate-500 mb-1">น้ำหนักบรรทุก</span>
                <span className="font-bold text-slate-800">{vehicle.payloadWeight?.toLocaleString()} <span className="text-xs font-normal">KG</span></span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="block text-xs text-slate-500 mb-1">ราคาที่ได้มา</span>
                <span className="font-bold text-slate-800 text-sm md:text-base">{vehicle.acquiredPrice ? `฿${vehicle.acquiredPrice.toLocaleString()}` : "-"}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/logs/trip/new" className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚗</span>
                <span className="text-xs font-bold">บันทึกเดินทาง</span>
              </Link>
              <Link href="/logs/maintenance/new" className="flex flex-col items-center justify-center p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⛽</span>
                <span className="text-xs font-bold">บันทึกเติมน้ำมัน</span>
              </Link>
              {role === "ADMIN" || role === "MANAGER" || role === "OFFICER" ? (
                <Link href={`/vehicles/${vehicle.id}/maintenance-docs`} className="flex flex-col items-center justify-center p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-colors group">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🛠️</span>
                  <span className="text-xs font-bold">ซ่อมบำรุง</span>
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 opacity-70 cursor-not-allowed">
                  <span className="text-2xl mb-1 grayscale">🛠️</span>
                  <span className="text-xs font-bold">ซ่อมบำรุง</span>
                </div>
              )}
              <Link href="/reports" className="flex flex-col items-center justify-center p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl border border-teal-200 transition-colors group">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📊</span>
                <span className="text-xs font-bold">รายงาน</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="card p-2 md:p-6 shadow-sm border-t border-slate-100">
        <div className="flex border-b mb-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "info" ? "border-teal-600 text-teal-700 bg-teal-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            📑 ข้อมูลทางทะเบียน
          </button>
          <button
            onClick={() => setActiveTab("trip")}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "trip" ? "border-teal-600 text-teal-700 bg-teal-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            🚗 ประวัติการเดินทาง
          </button>
          <button
            onClick={() => setActiveTab("fuel")}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "fuel" ? "border-teal-600 text-teal-700 bg-teal-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            ⛽ ประวัติเติมน้ำมัน
          </button>
        </div>

        {/* TAB CONTENT: INFO */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-teal-500 rounded"></span> หมายเลขประจำรถ
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-dashed">
                  <span className="text-sm text-slate-500">หมายเลขครุภัณฑ์:</span>
                  <span className="font-semibold text-slate-800">{vehicle.assetNumber || "-"}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-dashed">
                  <span className="text-sm text-slate-500">เลขตัวรถ (Chassis):</span>
                  <span className="font-mono bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-sm">{vehicle.chassisNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-dashed">
                  <span className="text-sm text-slate-500">เลขเครื่องยนต์ (Engine):</span>
                  <span className="font-mono bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-sm">{vehicle.engineNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">วันจดทะเบียน:</span>
                  <span className="font-semibold text-slate-800">{formatThaiDate(vehicle.registeredDate)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded"></span> พิกัดน้ำหนัก
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-dashed">
                  <span className="text-sm text-slate-500">น้ำหนักรถเปล่า:</span>
                  <span className="font-semibold text-slate-800">{vehicle.emptyWeight?.toLocaleString()} กก.</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-dashed">
                  <span className="text-sm text-slate-500">น้ำหนักบรรทุก:</span>
                  <span className="font-semibold text-slate-800">{vehicle.payloadWeight?.toLocaleString()} กก.</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-dashed">
                  <span className="text-sm text-slate-500">น้ำหนักรวม:</span>
                  <span className="font-bold text-teal-700">{vehicle.totalWeight?.toLocaleString()} กก.</span>
                </div>
                
                {/* Ratio Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">สัดส่วนบรรทุก</span>
                    <span className="text-slate-700 font-bold">{Math.round((vehicle.payloadWeight / vehicle.totalWeight) * 100) || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.round((vehicle.payloadWeight / vehicle.totalWeight) * 100) || 0}%` }}></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT: TRIP LOGS */}
        {activeTab === "trip" && (
          <div className="animate-in fade-in duration-300">
            {tripLogs && tripLogs.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">วันที่</th>
                      <th className="px-4 py-3">ผู้ขับขี่</th>
                      <th className="px-4 py-3">สถานที่ไป</th>
                      <th className="px-4 py-3 text-right">ระยะทาง (กม.)</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripLogs.map((log: any) => (
                      <tr key={log.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{log.travelDate}</td>
                        <td className="px-4 py-3 text-slate-600">{log.driverName}</td>
                        <td className="px-4 py-3 text-slate-600">{log.destination}</td>
                        <td className="px-4 py-3 text-slate-600 text-right">{log.distance?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${log.status === "เสร็จสิ้น" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <span className="text-4xl">🚗</span>
                <p className="text-slate-500 mt-2">ยังไม่มีประวัติการเดินทาง</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: FUEL LOGS */}
        {activeTab === "fuel" && (
          <div className="animate-in fade-in duration-300">
            {fuelLogs && fuelLogs.length > 0 ? (
               <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">วันที่เติม</th>
                      <th className="px-4 py-3">ปั๊มน้ำมัน</th>
                      <th className="px-4 py-3 text-right">จำนวนลิตร</th>
                      <th className="px-4 py-3 text-right">ราคารวม (฿)</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.map((log: any) => (
                      <tr key={log.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{log.fuelDate}</td>
                        <td className="px-4 py-3 text-slate-600">{log.fuelStation || "-"}</td>
                        <td className="px-4 py-3 text-slate-600 text-right">{log.liters.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-800 font-bold text-right">{log.totalCost.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${log.status === "อนุมัติแล้ว" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <span className="text-4xl">⛽</span>
                <p className="text-slate-500 mt-2">ยังไม่มีประวัติการเติมน้ำมัน</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
