"use client";

import React, { useState, useMemo } from "react";
import { formatThaiDate } from "../../../lib/date-formatter";

type FuelLog = {
  id: string;
  vehicleId: string;
  fuelDate: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  startMileage: number;
  endMileage: number;
  distance: number;
  standardRate: number;
  expectedFuel: number;
  fuelDifference: number;
  explanation: string;
  fuelStation: string;
  note: string;
  userId: string | null;
  department: string | null;
  createdAt: Date;
};

type TripLog = {
  id: string;
  vehicleId: string;
  driverName: string;
  department: string;
  destination: string;
  purpose: string;
  travelDate: string;
  startMileage: number;
  endMileage: number;
  distance: number;
  status: string;
  userId: string | null;
  createdAt: Date;
};

type MaintenanceLog = {
  id: string;
  vehicleId: string;
  maintenanceDate: string;
  mileage: number;
  details: string;
  cost: number;
  garageName: string;
  responsibleName: string;
  department: string;
  userId: string | null;
  createdAt: Date;
};

type VehicleWithLogs = {
  id: string;
  registeredDate: Date;
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
  department: string | null;
  assetNumber: string | null;
  acquiredPrice: number | null;
  fuelLogs: FuelLog[];
  tripLogs: TripLog[];
  maintenanceLogs: MaintenanceLog[];
};

export default function ReportView({ 
  vehicles, 
  role, 
  department = "กอง", 
  currentUser,
  managerName
}: { 
  vehicles: VehicleWithLogs[], 
  role: string, 
  department: string,
  currentUser?: { name: string, role: string, department: string },
  managerName?: string
}) {
  const currentYear = new Date().getFullYear();
  const currentThaiYear = currentYear + 543;
  
  // Basic Filters
  const [selectedYear, setSelectedYear] = useState(currentThaiYear.toString());
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState(role === "ADMIN" ? "ALL" : (department || "กอง"));
  const [selectedVehicle, setSelectedVehicle] = useState("ALL");

  // Tab State: 'summary' | 'all' | 'part1' | 'part2' | 'part3' | 'part4'
  const [activeTab, setActiveTab] = useState<"summary" | "all" | "part1" | "part2" | "part3" | "part4">("summary");

  // Defaults for Signature Inputs based on logged-in user
  const defaultReporterPos = currentUser?.role === "OFFICER" ? `เจ้าหน้าที่${currentUser.department ? " " + currentUser.department : "กอง"}` : 
                             currentUser?.role === "ADMIN" ? "นักวิชาการคอมพิวเตอร์" : 
                             "พนักงานขับรถ";
  const defaultReviewerPos = currentUser?.department ? `ผู้อำนวยการ${currentUser.department}` : "ผู้อำนวยการกอง";

  // Signature Inputs
  const [reporterName, setReporterName] = useState(currentUser?.name || "");
  const [reporterPos, setReporterPos] = useState(defaultReporterPos);
  const [reviewerName, setReviewerName] = useState(managerName || "");
  const [reviewerPos, setReviewerPos] = useState(defaultReviewerPos);

  const years = Array.from({ length: 5 }, (_, i) => (currentThaiYear - i).toString());

  const isInPeriod = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const thaiY = y + 543;

    let fiscalYear = thaiY;
    let q = 0;
    if (m >= 10 && m <= 12) {
      fiscalYear = thaiY + 1;
      q = 1;
    } else if (m >= 1 && m <= 3) {
      q = 2;
    } else if (m >= 4 && m <= 6) {
      q = 3;
    } else if (m >= 7 && m <= 9) {
      q = 4;
    }

    if (fiscalYear.toString() !== selectedYear) return false;
    if (selectedQuarter !== "ALL" && selectedQuarter !== `Q${q}`) return false;

    return true;
  };

  const getQuarterLabel = (q: string) => {
    switch(q) {
      case "Q1": return "ไตรมาส 1 (ต.ค. - ธ.ค.)";
      case "Q2": return "ไตรมาส 2 (ม.ค. - มี.ค.)";
      case "Q3": return "ไตรมาส 3 (เม.ย. - มิ.ย.)";
      case "Q4": return "ไตรมาส 4 (ก.ค. - ก.ย.)";
      default: return "รวมทั้งปีงบประมาณ";
    }
  };

  // Group departments, default empty values to "กอง"
  const departments = Array.from(new Set(vehicles.map(v => v.department || "กอง").filter(Boolean)));

  const reportData = useMemo(() => {
    return vehicles
      .filter((v) => (selectedDept === "ALL" ? true : (v.department || "กอง") === selectedDept))
      .filter((v) => (selectedVehicle === "ALL" ? true : v.id === selectedVehicle))
      .map((v) => {
        const validFuel = v.fuelLogs.filter(l => isInPeriod(l.fuelDate));
        const validTrip = v.tripLogs.filter(l => isInPeriod(l.travelDate));
        const validMaintenance = v.maintenanceLogs.filter(l => isInPeriod(l.maintenanceDate));

        const totalFuelLiters = validFuel.reduce((sum, l) => sum + (l.liters || 0), 0);
        const totalFuelCost = validFuel.reduce((sum, l) => sum + (l.totalCost || 0), 0);
        const totalTripDist = validTrip.reduce((sum, l) => sum + (l.distance || 0), 0);
        const totalMaintCost = validMaintenance.reduce((sum, l) => sum + (l.cost || 0), 0);
        
        const totalCost = totalFuelCost + totalMaintCost;

        return {
          ...v,
          fuelLogs: validFuel,
          tripLogs: validTrip,
          maintenanceLogs: validMaintenance,
          totalTripDist,
          totalFuelLiters,
          totalFuelCost,
          totalMaintCost,
          totalCost,
          hasData: totalTripDist > 0 || totalFuelCost > 0 || totalMaintCost > 0 || v.id === selectedVehicle
        };
      })
      .filter(v => v.hasData || selectedVehicle !== "ALL");
  }, [vehicles, selectedYear, selectedQuarter, selectedDept, selectedVehicle]);

  // Overall Statistics for Dashboard
  const summary = {
    vehiclesCount: reportData.length,
    distance: reportData.reduce((sum, v) => sum + v.totalTripDist, 0),
    fuelCost: reportData.reduce((sum, v) => sum + v.totalFuelCost, 0),
    maintCost: reportData.reduce((sum, v) => sum + v.totalMaintCost, 0),
    totalCost: reportData.reduce((sum, v) => sum + v.totalCost, 0),
  };

  // 10-year Straight-line Depreciation for Government Assets (Useful life: 10 years, salvage value: 1 THB)
  const getDepreciation = (registeredDate: Date | string, acquiredPrice: number | null) => {
    const cost = acquiredPrice || 0;
    const regDate = new Date(registeredDate);
    const now = new Date();
    let ageYears = now.getFullYear() - regDate.getFullYear();
    if (now.getMonth() < regDate.getMonth() || (now.getMonth() === regDate.getMonth() && now.getDate() < regDate.getDate())) {
      ageYears--;
    }
    ageYears = Math.max(0, ageYears);
    
    const usefulLife = 10;
    let annualDepreciation = 0;
    let accumulatedDepreciation = 0;
    let netBookValue = 0;

    if (cost > 0) {
      annualDepreciation = (cost - 1) / usefulLife;
      accumulatedDepreciation = Math.min(usefulLife, ageYears) * annualDepreciation;
      netBookValue = cost - accumulatedDepreciation;
    }
    
    return {
      cost,
      ageYears,
      accumulatedDepreciation,
      netBookValue
    };
  };

  // Detailed datasets mapped for tables
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => selectedDept === "ALL" ? true : (v.department || "กอง") === selectedDept);
  }, [vehicles, selectedDept]);

  const vehiclesAssetData = useMemo(() => {
    return availableVehicles
      .filter((v) => (selectedVehicle === "ALL" ? true : v.id === selectedVehicle))
      .map(v => {
        const dep = getDepreciation(v.registeredDate, v.acquiredPrice);
        return {
          ...v,
          dep
        };
      });
  }, [availableVehicles, selectedVehicle]);

  const fuelLogsData = useMemo(() => {
    const logs: any[] = [];
    reportData.forEach(v => {
      v.fuelLogs.forEach(l => {
        logs.push({
          ...l,
          licensePlate: v.licensePlate,
          vehicleType: v.vehicleType
        });
      });
    });
    return logs.sort((a, b) => b.fuelDate.localeCompare(a.fuelDate));
  }, [reportData]);

  const maintenanceLogsData = useMemo(() => {
    const logs: any[] = [];
    reportData.forEach(v => {
      v.maintenanceLogs.forEach(l => {
        logs.push({
          ...l,
          licensePlate: v.licensePlate
        });
      });
    });
    return logs.sort((a, b) => b.maintenanceDate.localeCompare(a.maintenanceDate));
  }, [reportData]);

  const tripLogsData = useMemo(() => {
    const logs: any[] = [];
    reportData.forEach(v => {
      v.tripLogs.forEach(l => {
        logs.push({
          ...l,
          licensePlate: v.licensePlate
        });
      });
    });
    return logs.sort((a, b) => b.travelDate.localeCompare(a.travelDate));
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
        
        /* Screen preview A4 paper simulation (HIDDEN ON SCREEN) */
        @media screen {
          .a4-paper-preview {
            display: none !important;
          }
        }

        @media print {
          /* Hide non-print elements */
          .no-print, .sidebar, header, .page-header, .navbar, .tab-bar, .app-layout > *:not(.main-content) { 
            display: none !important; 
          }
          
          /* Override layout wrappers for print to force alignment to the top and remove margins */
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            width: 100% !important;
          }
          .page-container {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .app-layout {
            display: block !important;
            width: 100% !important;
          }
          
          /* Page size configuration A4 Landscape */
          @page { 
            size: A4 landscape; 
            margin: 0; 
          }
          
          body, html { 
            background: white !important; 
            background-color: white !important;
            padding: 0 !important; 
            margin: 0 !important;
            color: black !important;
            font-family: "TH Sarabun New", "TH Sarabun PSK", "Sarabun", sans-serif !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-area { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important; 
            box-shadow: none !important; 
            border: none !important; 
            background: transparent !important; 
          }

          .a4-paper-preview {
            width: 297mm !important;
            height: 210mm !important;
            padding: 2.5cm 2cm 2cm 3cm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            font-family: "TH Sarabun New", "TH Sarabun PSK", "Sarabun", sans-serif !important;
            font-size: 16pt !important;
            color: black !important;
          }
          
          .a4-paper-preview table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 10px !important; 
            font-size: 14pt !important; 
            color: black !important; 
          }
          
          .a4-paper-preview th, 
          .a4-paper-preview td { 
            border: 1px solid black !important; 
            padding: 4px 6px !important; 
            color: black !important; 
            background: transparent !important; 
          }
          
          .a4-paper-preview th { 
            font-weight: bold !important; 
            text-align: center !important; 
            background-color: #f3f4f6 !important;
          }
          
          .a4-paper-preview td { 
            vertical-align: middle; 
          }
          
          .text-right { 
            text-align: right !important; 
          }
          
          .text-center { 
            text-align: center !important; 
          }
          
          /* Government Double Line Accounting total underline */
          .print-total-row td {
            border-top: 1px solid black !important;
            border-bottom: 3px double black !important;
            font-weight: bold !important;
          }
          
          /* Print page break between sections */
          .print-section-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          
          /* Symmetrical signature placement for A4 Landscape */
          .print-signature-area {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            margin-top: 30px !important;
            padding: 0 40px !important;
            page-break-inside: avoid !important;
            font-size: 14pt !important;
            color: black !important;
          }
          
          .print-sig-col {
            text-align: center !important;
            width: 280px !important;
          }
        }
      `}} />

      {/* Screen Header */}
      <div className="page-header no-print bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold text-teal-800 flex items-center gap-2">
            <span>📋</span> รายงานพัสดุ สตง. (ประเมินค่าใช้จ่ายยานพาหนะ)
          </h1>
          <p className="page-subtitle text-slate-500 text-sm mt-1">แสดงรายละเอียดรายงานควบคุมการใช้งานทรัพย์สินและการใช้เชื้อเพลิงตามระเบียบ</p>
        </div>
      </div>

      <div className="print-area">
        {/* Unified Report Configuration Card (No Print) */}
        <div className="card max-w-5xl no-print mb-8 bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Report Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b pb-2 border-slate-200">คัดกรองข้อมูลรายงาน</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">ปีงบประมาณ</label>
                  <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="form-select">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ไตรมาส</label>
                  <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} className="form-select">
                    <option value="ALL">รวมทั้งปีงบประมาณ</option>
                    <option value="Q1">ไตรมาส 1 (ต.ค. - ธ.ค.)</option>
                    <option value="Q2">ไตรมาส 2 (ม.ค. - มี.ค.)</option>
                    <option value="Q3">ไตรมาส 3 (เม.ย. - มิ.ย.)</option>
                    <option value="Q4">ไตรมาส 4 (ก.ค. - ก.ย.)</option>
                  </select>
                </div>
                {role === "ADMIN" && (
                  <div className="form-group">
                    <label className="form-label">กอง / หน่วยงาน</label>
                    <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedVehicle("ALL"); }} className="form-select">
                      <option value="ALL">ทั้งหมด (ทุกกอง/หน่วยงาน)</option>
                      {departments.map(d => <option key={d} value={d!}>{d}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">ยานพาหนะเฉพาะคัน</label>
                  <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="form-select">
                    <option value="ALL">รวมรถทุกคัน</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.licensePlate} ({v.vehicleType})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Side: Signatures */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b pb-2 border-slate-200">ข้อมูลผู้ลงนามในเอกสารควบคุม</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">ชื่อผู้จัดทำรายงาน</label>
                  <input type="text" value={reporterName} onChange={e => setReporterName(e.target.value)} className="form-input" placeholder="นาย/นาง..." />
                </div>
                <div className="form-group">
                  <label className="form-label">ตำแหน่งผู้จัดทำ</label>
                  <input type="text" value={reporterPos} onChange={e => setReporterPos(e.target.value)} className="form-input" placeholder="เจ้าพนักงาน..." />
                </div>
                <div className="form-group">
                  <label className="form-label">ชื่อผู้ตรวจสอบ</label>
                  <input type="text" value={reviewerName} onChange={e => setReviewerName(e.target.value)} className="form-input" placeholder="นาย/นาง..." />
                </div>
                <div className="form-group">
                  <label className="form-label">ตำแหน่งผู้ตรวจสอบ</label>
                  <input type="text" value={reviewerPos} onChange={e => setReviewerPos(e.target.value)} className="form-input" placeholder="ผู้อำนวยการ..." />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
            <div className="form-group max-w-md mx-auto">
              <label className="form-label text-center block mb-2 font-semibold text-slate-600">เลือกส่วนของรายงานที่ต้องการพิมพ์</label>
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)} 
                className="form-select font-bold text-center"
              >
                <option value="summary">📊 หน้าสรุป (ฟอร์มพัสดุ)</option>
                <option value="all">🗂 แสดงทั้งหมด (สำหรับจัดชุดพิมพ์)</option>
                <option value="part1">ส่วนที่ 1: ทรัพย์สินและค่าเสื่อม</option>
                <option value="part2">ส่วนที่ 2: สิ้นเปลืองเชื้อเพลิง</option>
                <option value="part3">ส่วนที่ 3: ประวัติซ่อมบำรุง</option>
                <option value="part4">ส่วนที่ 4: ประวัติการเดินทาง</option>
              </select>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handlePrint}
                className="bg-[#1E3A8A] hover:bg-[#0F172A] text-white font-black text-xl py-4 px-12 rounded-2xl shadow-[0_10px_25px_-5px_rgba(30,58,138,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(15,23,42,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 w-full max-w-lg cursor-pointer"
              >
                <span className="text-2xl">🖨️</span> สั่งพิมพ์รายงาน สตง. (A4)
              </button>
            </div>
          </div>
        </div>

        {/* Report Content (Hidden on screen, always shown on print) */}
        <div className="hidden print:block">

        {/* -------------------- SUMMARY PART (NEW FORM) -------------------- */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <div className={`a4-paper-preview ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-teal-900 print:text-black">รายงานรายละเอียดค่าใช้จ่ายและซ่อมบำรุงรักษารถยนต์ส่วนกลาง (พัสดุ)</h2>
              <p className="text-slate-600 text-lg mt-2 print:text-black">
                ประจำปีงบประมาณ {selectedYear} - {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "รวมทุกหน่วยงาน" : selectedDept}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-sm border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50 text-slate-800">
                    <th className="border border-slate-300 text-center py-3 px-2 w-12">ลำดับ</th>
                    <th className="border border-slate-300 text-center py-3 px-2">ทะเบียนรถ</th>
                    <th className="border border-slate-300 text-center py-3 px-2">ประเภทรถ</th>
                    <th className="border border-slate-300 text-center py-3 px-2">กอง/หน่วยงาน</th>
                    <th className="border border-slate-300 text-center py-3 px-2">ระยะทางวิ่ง (กม.)</th>
                    <th className="border border-slate-300 text-center py-3 px-2">น้ำมันที่ใช้ (ลิตร)</th>
                    <th className="border border-slate-300 text-center py-3 px-2">ค่าน้ำมัน (บาท)</th>
                    <th className="border border-slate-300 text-center py-3 px-2">ค่าซ่อมบำรุง (บาท)</th>
                    <th className="border border-slate-300 text-center py-3 px-2">รวมค่าใช้จ่าย (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="border border-slate-300 text-center py-10 text-slate-400">ไม่พบข้อมูล</td>
                    </tr>
                  ) : (
                    reportData.map((v, i) => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 text-center py-3">{i + 1}</td>
                        <td className="border border-slate-300 text-center font-bold text-slate-800">{v.licensePlate}</td>
                        <td className="border border-slate-300 text-center">{v.vehicleType}</td>
                        <td className="border border-slate-300 text-center">{v.department || "-"}</td>
                        <td className="border border-slate-300 text-right">{v.totalTripDist.toLocaleString()}</td>
                        <td className="border border-slate-300 text-right">{v.totalFuelLiters > 0 ? v.totalFuelLiters.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td className="border border-slate-300 text-right">{v.totalFuelCost > 0 ? v.totalFuelCost.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td className="border border-slate-300 text-right">{v.totalMaintCost > 0 ? v.totalMaintCost.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td className="border border-slate-300 text-right font-bold text-teal-700">{v.totalCost > 0 ? v.totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {reportData.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/50 font-bold border-t border-slate-300 print-total-row">
                      <td colSpan={4} className="border border-slate-300 text-center py-3 text-slate-800">รวมทั้งสิ้น</td>
                      <td className="border border-slate-300 text-right py-3">{reportData.reduce((sum, v) => sum + v.totalTripDist, 0).toLocaleString()}</td>
                      <td className="border border-slate-300 text-right py-3">{reportData.reduce((sum, v) => sum + v.totalFuelLiters, 0) > 0 ? reportData.reduce((sum, v) => sum + v.totalFuelLiters, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "-"}</td>
                      <td className="border border-slate-300 text-right py-3">{reportData.reduce((sum, v) => sum + v.totalFuelCost, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                      <td className="border border-slate-300 text-right py-3">{reportData.reduce((sum, v) => sum + v.totalMaintCost, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                      <td className="border border-slate-300 text-right py-3 font-extrabold text-teal-800">{reportData.reduce((sum, v) => sum + v.totalCost, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Signatures */}
            <div className="mt-16 px-10 flex justify-between text-sm print:flex print-signature-area">
              <div className="text-center w-[320px]">
                <p>ลงชื่อ..........................................................ผู้จัดทำ</p>
                <p>รายงาน</p>
                <p className="mt-2">( {reporterName || "เรวัฒน์ แพนพัฒน์"} )</p>
                <p className="mt-2">ตำแหน่ง {reporterPos || "เจ้าหน้าที่ กองช่าง"}</p>
              </div>
              <div className="text-center w-[320px]">
                <p>ลงชื่อ..........................................................ผู้ตรวจสอบ</p>
                <p className="invisible">รายงาน</p>
                <p className="mt-2">( {reviewerName || "สรพงษ์ พัฒนะแสง"} )</p>
                <p className="mt-2">ตำแหน่ง {reviewerPos || "ผู้อำนวยการกองช่าง"}</p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PART 1 -------------------- */}
        {(activeTab === 'all' || activeTab === 'part1') && (
          <div className={`a4-paper-preview ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">

              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 1: รายงานคุมยอดบัญชีทรัพย์สินยานพาหนะและการคำนวณค่าเสื่อมราคา</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ {selectedYear} - {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "รวมทุกหน่วยงาน" : selectedDept}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="w-12 text-center py-3">ลำดับ</th>
                    <th className="text-center py-3">เลขครุภัณฑ์</th>
                    <th className="text-center py-3">ทะเบียนรถ</th>
                    <th className="text-center py-3">ประเภทรถ</th>
                    <th className="text-center py-3">ยี่ห้อ / รุ่น</th>
                    <th className="text-center py-3">วันที่ได้มา</th>
                    <th className="text-center py-3">อายุ (ปี)</th>
                    <th className="text-right py-3">ราคาทุน (บาท)</th>
                    <th className="text-right py-3">ค่าเสื่อมสะสม (บาท)</th>
                    <th className="text-right py-3">มูลค่าสุทธิ (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehiclesAssetData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-slate-400">ไม่พบรายการข้อมูลทรัพย์สินตามเงื่อนไข</td>
                    </tr>
                  ) : (
                    vehiclesAssetData.map((v, i) => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="text-center py-3">{i + 1}</td>
                        <td className="text-center text-xs text-slate-500 font-mono">{v.assetNumber || "-"}</td>
                        <td className="text-center font-bold text-slate-800">{v.licensePlate}</td>
                        <td className="text-center">{v.vehicleType}</td>
                        <td className="text-center">{v.brand} {v.model}</td>
                        <td className="text-center">{formatThaiDate(v.registeredDate)}</td>
                        <td className="text-center">{v.dep.ageYears} ปี</td>
                        <td className="text-right font-medium">{v.dep.cost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        <td className="text-right text-slate-500 font-medium">{v.dep.accumulatedDepreciation.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        <td className="text-right font-bold text-teal-700">{v.dep.netBookValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {vehiclesAssetData.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/50 font-bold border-t border-slate-200 print-total-row">
                      <td colSpan={7} className="text-center py-3 text-slate-800">รวมทั้งสิ้น</td>
                      <td className="text-right py-3 font-extrabold">
                        {vehiclesAssetData.reduce((sum, v) => sum + v.dep.cost, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-3 font-medium text-slate-600">
                        {vehiclesAssetData.reduce((sum, v) => sum + v.dep.accumulatedDepreciation, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-3 font-black text-teal-800">
                        {vehiclesAssetData.reduce((sum, v) => sum + v.dep.netBookValue, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mandatory Regulatory Warning */}
            <div className="text-center text-red-600 font-bold text-sm mt-8 py-2.5 border border-red-200 bg-red-50/50 rounded-xl print:bg-transparent print:border-none print:text-black print:text-[10pt] print:mt-10">
              ⚠️ ห้ามลืม ระเบียบ ราชการ (สตง).
            </div>

            {/* Signatures for Print */}
            <div className="hidden print-signature-area">
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้จัดทำรายงาน</p>
                <p className="mt-2">( {reporterName ? reporterName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reporterPos ? reporterPos : ".........................................................."}</p>
              </div>
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้ตรวจสอบ</p>
                <p className="mt-2">( {reviewerName ? reviewerName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reviewerPos ? reviewerPos : ".........................................................."}</p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PART 2 -------------------- */}
        {(activeTab === 'all' || activeTab === 'part2') && (
          <div className={`a4-paper-preview ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">

              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 2: รายงานรายละเอียดค่าน้ำมันเชื้อเพลิงและการตรวจสอบอัตราสิ้นเปลือง</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ {selectedYear} - {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "รวมทุกหน่วยงาน" : selectedDept}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="w-12 text-center py-3">ลำดับ</th>
                    <th className="text-center py-3">วันที่เติมน้ำมัน</th>
                    <th className="text-center py-3">ทะเบียนรถ</th>
                    <th className="text-right py-3">ไมล์เริ่มต้น (กม.)</th>
                    <th className="text-right py-3">ไมล์สิ้นสุด (กม.)</th>
                    <th className="text-right py-3">ระยะทางสะสม (กม.)</th>
                    <th className="text-right py-3">ปริมาณน้ำมัน (ลิตร)</th>
                    <th className="text-right py-3">สิ้นเปลืองจริง (กม./ลิตร)</th>
                    <th className="text-right py-3">เกณฑ์สิ้นเปลือง (กม./ลิตร)</th>
                    <th className="text-right py-3">ส่วนต่างเกณฑ์ (ลิตร)</th>
                    <th className="text-center py-3">คำชี้แจง / เหตุผล</th>
                    <th className="text-center py-3">สถานีบริการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fuelLogsData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-10 text-slate-400">ไม่พบประวัติการเติมน้ำมันเชื้อเพลิงในช่วงเวลานี้</td>
                    </tr>
                  ) : (
                    fuelLogsData.map((l, i) => {
                      const actualRate = l.distance > 0 ? (l.distance / l.liters) : 0;
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50">
                          <td className="text-center py-3">{i + 1}</td>
                          <td className="text-center">{formatThaiDate(l.fuelDate)}</td>
                          <td className="text-center font-semibold text-slate-800">{l.licensePlate}</td>
                          <td className="text-right">{l.startMileage.toLocaleString()}</td>
                          <td className="text-right">{l.endMileage.toLocaleString()}</td>
                          <td className="text-right font-medium">{l.distance.toLocaleString()}</td>
                          <td className="text-right">{l.liters.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="text-right font-semibold text-teal-700">{actualRate > 0 ? actualRate.toFixed(2) : "-"}</td>
                          <td className="text-right text-slate-500">{l.standardRate.toFixed(1)}</td>
                          <td className={`text-right font-medium ${l.fuelDifference > 0 ? "text-red-600" : "text-emerald-700"}`}>
                            {l.fuelDifference > 0 ? `+${l.fuelDifference.toFixed(2)}` : l.fuelDifference.toFixed(2)}
                          </td>
                          <td className="text-center text-xs italic text-slate-600 truncate max-w-[120px]" title={l.explanation}>
                            {l.explanation || "อยู่ในเกณฑ์ควบคุม"}
                          </td>
                          <td className="text-center text-xs text-slate-500">{l.fuelStation}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {fuelLogsData.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/50 font-bold border-t border-slate-200 print-total-row">
                      <td colSpan={5} className="text-center py-3 text-slate-800">รวมทั้งสิ้น</td>
                      <td className="text-right py-3 text-teal-800 font-extrabold">
                        {fuelLogsData.reduce((sum, l) => sum + l.distance, 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3 font-extrabold">
                        {fuelLogsData.reduce((sum, l) => sum + l.liters, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-3 text-teal-800">
                        {(fuelLogsData.reduce((sum, l) => sum + l.distance, 0) / fuelLogsData.reduce((sum, l) => sum + l.liters, 0)).toFixed(2)}
                      </td>
                      <td className="text-right py-3">-</td>
                      <td className="text-right py-3 font-bold text-red-600">
                        {fuelLogsData.reduce((sum, l) => sum + l.fuelDifference, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td colSpan={2} className="py-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mandatory Regulatory Warning */}
            <div className="text-center text-red-600 font-bold text-sm mt-8 py-2.5 border border-red-200 bg-red-50/50 rounded-xl print:bg-transparent print:border-none print:text-black print:text-[10pt] print:mt-10">
              ⚠️ ห้ามลืม ระเบียบ ราชการ (สตง).
            </div>

            {/* Signatures for Print */}
            <div className="hidden print-signature-area">
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้จัดทำรายงาน</p>
                <p className="mt-2">( {reporterName ? reporterName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reporterPos ? reporterPos : ".........................................................."}</p>
              </div>
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้ตรวจสอบ</p>
                <p className="mt-2">( {reviewerName ? reviewerName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reviewerPos ? reviewerPos : ".........................................................."}</p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PART 3 -------------------- */}
        {(activeTab === 'all' || activeTab === 'part3') && (
          <div className={`a4-paper-preview ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">

              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 3: รายงานคุมรายละเอียดการซ่อมบำรุงรักษา พัสดุ และอะไหล่ยานพาหนะ</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ {selectedYear} - {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "รวมทุกหน่วยงาน" : selectedDept}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="w-12 text-center py-3">ลำดับ</th>
                    <th className="text-center py-3">วันที่ซ่อมบำรุง</th>
                    <th className="text-center py-3">ทะเบียนรถ</th>
                    <th className="text-right py-3">เลขไมล์รถ (กม.)</th>
                    <th className="text-left py-3">รายละเอียดการชำรุด / การซ่อมแซม อะไหล่</th>
                    <th className="text-center py-3">ร้านค้า / อู่ซ่อม</th>
                    <th className="text-right py-3">ค่าซ่อมบำรุง (บาท)</th>
                    <th className="text-center py-3">ผู้บันทึก / ผู้ควบคุม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceLogsData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">ไม่พบประวัติการซ่อมบำรุงรักษายานพาหนะในช่วงเวลานี้</td>
                    </tr>
                  ) : (
                    maintenanceLogsData.map((l, i) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="text-center py-3">{i + 1}</td>
                        <td className="text-center">{formatThaiDate(l.maintenanceDate)}</td>
                        <td className="text-center font-semibold text-slate-800">{l.licensePlate}</td>
                        <td className="text-right">{l.mileage.toLocaleString()}</td>
                        <td className="text-left max-w-md text-xs py-3 whitespace-pre-wrap">{l.details}</td>
                        <td className="text-center text-xs">{l.garageName}</td>
                        <td className="text-right font-bold text-amber-700">{l.cost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        <td className="text-center text-xs">{l.responsibleName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {maintenanceLogsData.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/50 font-bold border-t border-slate-200 print-total-row">
                      <td colSpan={6} className="text-center py-3 text-slate-800">รวมทั้งสิ้น</td>
                      <td className="text-right py-3 font-black text-amber-800">
                        {maintenanceLogsData.reduce((sum, l) => sum + l.cost, 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mandatory Regulatory Warning */}
            <div className="text-center text-red-600 font-bold text-sm mt-8 py-2.5 border border-red-200 bg-red-50/50 rounded-xl print:bg-transparent print:border-none print:text-black print:text-[10pt] print:mt-10">
              ⚠️ ห้ามลืม ระเบียบ ราชการ (สตง).
            </div>

            {/* Signatures for Print */}
            <div className="hidden print-signature-area">
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้จัดทำรายงาน</p>
                <p className="mt-2">( {reporterName ? reporterName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reporterPos ? reporterPos : ".........................................................."}</p>
              </div>
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้ตรวจสอบ</p>
                <p className="mt-2">( {reviewerName ? reviewerName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reviewerPos ? reviewerPos : ".........................................................."}</p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PART 4 -------------------- */}
        {(activeTab === 'all' || activeTab === 'part4') && (
          <div className={`a4-paper-preview ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">

              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 4: รายงานประวัติการใช้ยานพาหนะและบันทึกระยะทางการเดินทางราชการ</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ {selectedYear} - {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "รวมทุกหน่วยงาน" : selectedDept}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="w-12 text-center py-3">ลำดับ</th>
                    <th className="text-center py-3">วันที่เดินทาง</th>
                    <th className="text-center py-3">ทะเบียนรถ</th>
                    <th className="text-center py-3">พนักงานขับรถ</th>
                    <th className="text-left py-3">สถานที่ไปราชการ / เส้นทาง</th>
                    <th className="text-left py-3">วัตถุประสงค์การใช้รถ</th>
                    <th className="text-right py-3">เลขไมล์เริ่ม-สิ้นสุด</th>
                    <th className="text-right py-3">ระยะทาง (กม.)</th>
                    <th className="text-center py-3">สถานะควบคุม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tripLogsData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">ไม่พบประวัติบันทึกการใช้รถยนต์ในช่วงเวลานี้</td>
                    </tr>
                  ) : (
                    tripLogsData.map((l, i) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="text-center py-3">{i + 1}</td>
                        <td className="text-center">{formatThaiDate(l.travelDate)}</td>
                        <td className="text-center font-semibold text-slate-800">{l.licensePlate}</td>
                        <td className="text-center text-xs">{l.driverName}</td>
                        <td className="text-left max-w-[150px] truncate text-xs" title={l.destination}>{l.destination}</td>
                        <td className="text-left max-w-[180px] truncate text-xs" title={l.purpose}>{l.purpose}</td>
                        <td className="text-right text-xs font-mono">{l.startMileage.toLocaleString()} - {l.endMileage.toLocaleString()}</td>
                        <td className="text-right font-bold text-teal-700">{l.distance.toLocaleString()}</td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {tripLogsData.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/50 font-bold border-t border-slate-200 print-total-row">
                      <td colSpan={7} className="text-center py-3 text-slate-800">รวมทั้งสิ้น</td>
                      <td className="text-right py-3 font-black text-teal-800">
                        {tripLogsData.reduce((sum, l) => sum + l.distance, 0).toLocaleString()}
                      </td>
                      <td className="py-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mandatory Regulatory Warning */}
            <div className="text-center text-red-600 font-bold text-sm mt-8 py-2.5 border border-red-200 bg-red-50/50 rounded-xl print:bg-transparent print:border-none print:text-black print:text-[10pt] print:mt-10">
              ⚠️ ห้ามลืม ระเบียบ ราชการ (สตง).
            </div>

            {/* Signatures for Print */}
            <div className="hidden print-signature-area">
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้จัดทำรายงาน</p>
                <p className="mt-2">( {reporterName ? reporterName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reporterPos ? reporterPos : ".........................................................."}</p>
              </div>
              <div className="print-sig-col">
                <p>ลงชื่อ..........................................................ผู้ตรวจสอบ</p>
                <p className="mt-2">( {reviewerName ? reviewerName : ".........................................................."} )</p>
                <p className="mt-1">ตำแหน่ง {reviewerPos ? reviewerPos : ".........................................................."}</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
