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
          
          {/* TAB 1: รายการจดทะเบียน */}
          {activeTab === "info" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-teal-800 mb-4 pb-2 border-b flex items-center gap-2">
                <span>📑</span> รายละเอียดทางทะเบียนและวิศวกรรม
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-teal-700 text-sm border-b pb-2">ข้อมูลทั่วไป</h4>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>วันจดทะเบียน:</strong> <span>{formatThaiDate(vehicle.registeredDate)}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>ประเภท:</strong> <span>{vehicle.vehicleType}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>ลักษณะรถ:</strong> <span>{vehicle.bodyType}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>สีตัวถัง:</strong> <span>{vehicle.color}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>หมายเลขครุภัณฑ์:</strong> <span>{vehicle.assetNumber || "-"}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>ราคาที่ได้มา:</strong> <span>{vehicle.acquiredPrice ? `${vehicle.acquiredPrice.toLocaleString("th-TH")} ฿` : "-"}</span></p>
                </div>

                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-amber-700 text-sm border-b pb-2">เลขตัวถัง & เครื่องยนต์</h4>
                  <p className="text-sm text-slate-600 flex justify-between items-center"><strong>เลขตัวรถ:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border">{vehicle.chassisNumber}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between items-center"><strong>เลขเครื่องยนต์:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border">{vehicle.engineNumber}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>ประเภทเชื้อเพลิง:</strong> <span>{vehicle.fuelType}</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>ขนาดเครื่องยนต์:</strong> <span>{vehicle.engineCapacity?.toLocaleString()} ซีซี</span></p>
                </div>

                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-indigo-700 text-sm border-b pb-2">พิกัดน้ำหนัก (กก.)</h4>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>น้ำหนักรถเปล่า:</strong> <span>{vehicle.emptyWeight?.toLocaleString()} กก.</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>น้ำหนักบรรทุก:</strong> <span>{vehicle.payloadWeight?.toLocaleString()} กก.</span></p>
                  <p className="text-sm text-slate-600 flex justify-between"><strong>น้ำหนักรวมประจำรถ:</strong> <span>{vehicle.totalWeight?.toLocaleString()} กก.</span></p>
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
