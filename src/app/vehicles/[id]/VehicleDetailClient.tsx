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
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      {/* ส่วนหัว: สรุปข้อมูลหลักและสถานะรถ */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase">
              {vehicle.brand}
            </span>
            <span className="text-slate-500 text-sm">ID: {vehicle.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mt-1">
            {vehicle.licensePlate} {vehicle.province}
          </h1>
          <p className="text-slate-600 font-medium">{vehicle.model} — {vehicle.bodyType}</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 text-sm">
                {vehicle.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {role === "ADMIN" || role === "MANAGER" || role === "OFFICER" ? (
              <Link href={`/vehicles/${vehicle.id}/maintenance-docs`} className="btn bg-indigo-600 text-white text-sm py-1.5 px-3 hover:bg-indigo-700">
                🛠️ ออกเอกสารซ่อมบำรุง
              </Link>
            ) : null}
            {role === "ADMIN" && (
              <Link href={`/vehicles/${vehicle.id}/edit`} className="btn btn-warning text-sm py-1.5 px-3">
                ✏️ แก้ไขข้อมูลรถ
              </Link>
            )}
            <Link href="/vehicles" className="btn btn-ghost text-sm py-1.5 px-3">
              ← กลับ
            </Link>
          </div>
        </div>
      </div>

      {/* แถบเมนู (Tabs Navigation) */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg p-1 shadow-sm gap-2">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "info" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📋 รายการจดทะเบียน (คส.1)
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "trips" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🚗 ประวัติการใช้รถ
        </button>
        <button
          onClick={() => setActiveTab("fuel")}
          className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
            activeTab === "fuel" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ⛽ ประวัติการเติมน้ำมัน
        </button>
      </div>

      {/* พื้นที่แสดงเนื้อหาตามแถบที่เลือก (Tab Panels) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        
        {/* TAB 1: รายการจดทะเบียน */}
        {activeTab === "info" && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">รายละเอียดทางทะเบียนและวิศวกรรม</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 text-sm">ข้อมูลทั่วไป</h4>
                <p className="text-sm text-slate-600"><strong>วันจดทะเบียน:</strong> {formatThaiDate(vehicle.registeredDate)}</p>
                <p className="text-sm text-slate-600"><strong>ประเภท:</strong> {vehicle.vehicleType}</p>
                <p className="text-sm text-slate-600"><strong>ลักษณะรถ:</strong> {vehicle.bodyType}</p>
                <p className="text-sm text-slate-600"><strong>สีตัวถัง:</strong> {vehicle.color}</p>
                <p className="text-sm text-slate-600"><strong>หมายเลขครุภัณฑ์:</strong> {vehicle.assetNumber || "-"}</p>
                <p className="text-sm text-slate-600"><strong>ราคาที่ได้มา:</strong> {vehicle.acquiredPrice ? `${vehicle.acquiredPrice.toLocaleString("th-TH")} บาท` : "-"}</p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 text-sm">เลขตัวถัง & เครื่องยนต์</h4>
                <p className="text-sm text-slate-600"><strong>เลขตัวรถ:</strong> <span className="font-mono">{vehicle.chassisNumber}</span></p>
                <p className="text-sm text-slate-600"><strong>เลขเครื่องยนต์:</strong> <span className="font-mono">{vehicle.engineNumber}</span></p>
                <p className="text-sm text-slate-600"><strong>ประเภทเชื้อเพลิง:</strong> {vehicle.fuelType}</p>
                <p className="text-sm text-slate-600"><strong>ขนาดเครื่องยนต์:</strong> {vehicle.engineCapacity?.toLocaleString()} ซีซี</p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 text-sm">พิกัดน้ำหนัก (กก.)</h4>
                <p className="text-sm text-slate-600"><strong>น้ำหนักรถเปล่า:</strong> {vehicle.emptyWeight?.toLocaleString()} กก.</p>
                <p className="text-sm text-slate-600"><strong>น้ำหนักบรรทุก:</strong> {vehicle.payloadWeight?.toLocaleString()} กก.</p>
                <p className="text-sm text-slate-600"><strong>น้ำหนักรวมประจำรถ:</strong> {vehicle.totalWeight?.toLocaleString()} กก.</p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ประวัติการใช้รถ */}
        {activeTab === "trips" && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">ประวัติการใช้รถยนต์ส่วนกลาง</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-sm font-semibold border-b">
                    <th className="p-3">วันที่เดินทาง</th>
                    <th className="p-3">คนขับ / ผู้ขอ</th>
                    <th className="p-3">จุดหมาย</th>
                    <th className="p-3">ระยะทาง</th>
                    <th className="p-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y text-slate-600">
                  {tripLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center">ไม่มีข้อมูล</td></tr>
                  ) : (
                    tripLogs.map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50">
                        <td className="p-3">{formatThaiDate(trip.travelDate)}</td>
                        <td className="p-3 font-medium text-slate-800">{trip.driverName}</td>
                        <td className="p-3">{trip.destination}</td>
                        <td className="p-3">{trip.distance} กม.</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
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
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">ประวัติการเติมน้ำมัน</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-sm font-semibold border-b">
                    <th className="p-3">วันที่เติม</th>
                    <th className="p-3">จำนวนลิตร</th>
                    <th className="p-3">ราคา/ลิตร</th>
                    <th className="p-3">ยอดรวม (บาท)</th>
                    <th className="p-3">สถานี/สถานที่</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y text-slate-600">
                  {fuelLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center">ไม่มีข้อมูล</td></tr>
                  ) : (
                    fuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3">{formatThaiDate(log.fuelDate)}</td>
                        <td className="p-3">{log.liters.toFixed(2)}</td>
                        <td className="p-3">{log.pricePerLiter.toFixed(2)}</td>
                        <td className="p-3 text-amber-700 font-semibold">{log.totalCost.toLocaleString()}.-</td>
                        <td className="p-3">{log.fuelStation || "-"}</td>
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
  );
}
