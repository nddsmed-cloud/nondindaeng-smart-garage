"use client";

import { useState, useEffect } from "react";
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
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours mock countdown
  const [activePackage, setActivePackage] = useState<"daily" | "monthly">("daily");

  // Mock countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-6 lg:p-8 font-sans selection:bg-teal-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- TOP: Header Controls --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <Link href="/vehicles" className="bg-slate-700/50 hover:bg-slate-600 text-white p-2.5 rounded-full transition-all border border-slate-600 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                {vehicle.licensePlate} <span className="text-teal-400 text-lg">|</span> {vehicle.province}
              </h1>
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">ID: {vehicle.id.slice(0, 8)}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/50 transition-all border border-teal-400/30">
              <span>📷</span> อัปโหลดภาพล่าสุด
            </button>
            {role === "ADMIN" && (
              <Link href={`/vehicles/${vehicle.id}/edit`} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg transition-all border border-slate-600">
                ✏️ แก้ไขข้อมูล
              </Link>
            )}
          </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Basic Info */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Vehicle Specs
              </h3>

              <div className="space-y-5 flex-1 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">ยี่ห้อ / รุ่น</p>
                  <p className="text-lg font-bold text-white leading-tight">{vehicle.brand} {vehicle.model}</p>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">ประเภทรถ / ตัวถัง</p>
                  <p className="text-base font-semibold text-slate-200">{vehicle.vehicleType} <span className="text-slate-500 mx-1">•</span> {vehicle.bodyType}</p>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-slate-700 to-transparent"></div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">เครื่องยนต์</p>
                  <p className="text-base font-bold text-slate-200 font-mono">{vehicle.engineCapacity?.toLocaleString()} <span className="text-xs text-slate-500 font-sans">CC</span></p>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-slate-700 to-transparent"></div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">ปีที่จดทะเบียน</p>
                  <p className="text-base font-semibold text-slate-200">{formatThaiDate(vehicle.registeredDate)}</p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-slate-700 to-transparent"></div>

                <div className="pt-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">มูลค่าทรัพย์สิน</p>
                  <p className="text-2xl font-black text-emerald-400 bg-emerald-500/10 inline-block px-3 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                    {vehicle.acquiredPrice ? `฿${vehicle.acquiredPrice.toLocaleString("th-TH")}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER PANEL: Hero Image & Packages */}
          <div className="lg:col-span-6 space-y-6 flex flex-col">
            
            {/* Top Center: Hero Image */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200" 
                alt="Latest Vehicle Photo" 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
              
              {/* Overlay Status Badge */}
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-slate-600/50 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {vehicle.status}
                </span>
              </div>
              <div className="absolute top-4 right-4 text-slate-300/80 text-[10px] uppercase tracking-widest font-bold bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                อัปเดตล่าสุด: {formatThaiDate(vehicle.updatedAt)}
              </div>
            </div>

            {/* Bottom Center: Rental Packages & Timer */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl flex-1 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex-1 w-full relative z-10">
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 text-center md:text-left">Select Package</h3>
                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/50 shadow-inner w-full">
                  <button 
                    onClick={() => setActivePackage("daily")}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                      activePackage === "daily" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    รายวัน (Daily)
                  </button>
                  <button 
                    onClick={() => setActivePackage("monthly")}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                      activePackage === "monthly" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    รายเดือน (Monthly)
                  </button>
                </div>
                <div className="mt-4 text-center md:text-left">
                  <p className="text-xs text-slate-500 font-medium">ค่าบริการจำลอง: <span className="text-slate-300 font-bold">{activePackage === "daily" ? "1,200 ฿ / วัน" : "25,000 ฿ / เดือน"}</span></p>
                </div>
              </div>

              <div className="w-px h-24 bg-gradient-to-b from-transparent via-slate-600 to-transparent hidden md:block"></div>

              <div className="flex-1 w-full text-center relative z-10">
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-2">Time Remaining</h3>
                <div className="font-mono text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm tracking-tight">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  <span>HRS</span>
                  <span>MIN</span>
                  <span>SEC</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Status Bars (Game-like) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
              
              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Live Status
              </h3>

              <div className="space-y-7 flex-1 relative z-10">
                
                {/* Fuel Level */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-amber-400">⛽</span> Fuel Level
                    </span>
                    <span className="text-sm font-black text-white">78%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 w-[78%] rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Condition */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-emerald-400">🔧</span> Condition
                    </span>
                    <span className="text-sm font-black text-white">92%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[92%] rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                    </div>
                  </div>
                </div>

                {/* Daily Usage Limit */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-blue-400">🚗</span> Daily Usage
                    </span>
                    <span className="text-sm font-black text-white">142<span className="text-xs text-slate-500 font-medium ml-1">/200km</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 w-[71%] rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-slate-700 to-transparent"></div>

                {/* Star Rating Readiness */}
                <div className="pt-2 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Readiness Level</p>
                  <div className="flex justify-center gap-1 text-2xl text-amber-400 drop-shadow-md">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-700">★</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-bold mt-2 bg-emerald-400/10 inline-block px-2 py-1 rounded-md border border-emerald-400/20">พร้อมออกปฏิบัติงาน</p>
                </div>
                
              </div>
            </div>
          </div>

        </div>

        {/* --- BOTTOM: Action Buttons --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          
          <Link href="/logs/trip/new" className="group bg-slate-800/40 hover:bg-indigo-600/20 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/50 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/20 hover:-translate-y-1 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors border border-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white">บันทึกการเดินทาง</span>
          </Link>

          <Link href="/logs/maintenance/new" className="group bg-slate-800/40 hover:bg-amber-500/20 backdrop-blur-md border border-slate-700/50 hover:border-amber-500/50 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-1 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white">บันทึกเติมน้ำมัน</span>
          </Link>

          {role === "ADMIN" || role === "MANAGER" || role === "OFFICER" ? (
            <Link href={`/vehicles/${vehicle.id}/maintenance-docs`} className="group bg-slate-800/40 hover:bg-rose-500/20 backdrop-blur-md border border-slate-700/50 hover:border-rose-500/50 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-rose-900/20 hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors border border-rose-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">ซ่อมบำรุง / ออกเอกสาร</span>
            </Link>
          ) : (
            <div className="opacity-50 group bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-not-allowed">
               <div className="w-12 h-12 rounded-2xl bg-slate-700/50 flex items-center justify-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-400">ซ่อมบำรุง (ล็อก)</span>
            </div>
          )}

          <Link href="/reports" className="group bg-slate-800/40 hover:bg-teal-500/20 backdrop-blur-md border border-slate-700/50 hover:border-teal-500/50 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/20 hover:-translate-y-1 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors border border-teal-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white">รายงานการใช้งาน</span>
          </Link>

        </div>
      </div>
    </div>
  );
}
