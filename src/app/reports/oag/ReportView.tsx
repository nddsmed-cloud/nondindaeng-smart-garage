"use client";

import { useState, useMemo } from "react";

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
  const getDepreciation = (registeredDate: Date | string, type: string) => {
    const cost = type.includes("ตู้") ? 1200000 : 
                 type.includes("กระบะ") ? 800000 : 
                 type.includes("เก๋ง") ? 600000 : 750000;
    const regDate = new Date(registeredDate);
    const now = new Date();
    let ageYears = now.getFullYear() - regDate.getFullYear();
    if (now.getMonth() < regDate.getMonth() || (now.getMonth() === regDate.getMonth() && now.getDate() < regDate.getDate())) {
      ageYears--;
    }
    ageYears = Math.max(0, ageYears);
    
    const usefulLife = 10;
    const annualDepreciation = (cost - 1) / usefulLife;
    const accumulatedDepreciation = Math.min(usefulLife, ageYears) * annualDepreciation;
    const netBookValue = cost - accumulatedDepreciation;
    
    return {
      cost,
      ageYears,
      accumulatedDepreciation,
      netBookValue
    };
  };

  // Detailed datasets mapped for tables
  const vehiclesAssetData = useMemo(() => {
    return reportData.map(v => {
      const dep = getDepreciation(v.registeredDate, v.vehicleType);
      return {
        ...v,
        dep
      };
    });
  }, [reportData]);

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

  const availableVehicles = vehicles.filter(v => selectedDept === "ALL" ? true : (v.department || "กอง") === selectedDept);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
        
        @media print {
          /* Hide non-print elements */
          .no-print, .sidebar, header, .page-header, .navbar, .tab-bar { 
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
          
          /* Page size configuration with 5mm top margin to align details at the top */
          @page { 
            size: A4 landscape; 
            margin: 5mm 15mm 15mm 15mm; 
          }
          
          body, html { 
            background: white !important; 
            background-color: white !important;
            padding: 0 !important; 
            margin: 0 !important;
            color: black !important;
            font-family: "Sarabun", "TH Sarabun New", sans-serif !important;
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
            backdrop-filter: none !important; 
          }
          
          /* Remove background colors and shadows from cards */
          .bg-white, .bg-slate-50, .bg-red-50\/50, .bg-emerald-50\/30, .shadow-sm, .border {
            background-color: transparent !important;
            background: transparent !important;
            box-shadow: none !important;
            border-color: black !important;
          }
          
          .dashboard-cards { 
            display: none !important; 
          }
          
          .print-title {
            font-size: 16pt !important;
            font-weight: bold !important;
            text-align: center !important;
            margin-bottom: 2px !important;
            color: black !important;
          }
          
          .print-subtitle {
            font-size: 13pt !important;
            text-align: center !important;
            margin-bottom: 12px !important;
            color: black !important;
          }

          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 10px !important; 
            font-size: 10pt !important; 
            color: black !important; 
          }
          
          tr { 
            background: transparent !important; 
            page-break-inside: avoid !important;
          }
          
          th, td { 
            border: 1px solid black !important; 
            padding: 4px 6px !important; 
            color: black !important; 
            background: transparent !important; 
          }
          
          th { 
            font-weight: bold !important; 
            text-align: center !important; 
            background-color: #f3f4f6 !important;
          }
          
          td { 
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
            font-size: 11pt !important;
            color: black !important;
          }
          
          .print-sig-col {
            text-align: center !important;
            width: 280px !important;
          }
        }
      `}} />

      {/* Screen Header */}
      <div className="page-header no-print flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold text-teal-800 flex items-center gap-2">
            <span>📋</span> รายงานพัสดุ สตง. (ประเมินค่าใช้จ่ายยานพาหนะ)
          </h1>
          <p className="page-subtitle text-slate-500 text-sm mt-1">แสดงรายละเอียดรายงานควบคุมการใช้งานทรัพย์สินและการใช้เชื้อเพลิงตามระเบียบ</p>
        </div>
        <button 
          className="btn bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0" 
          onClick={handlePrint}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          พิมพ์รายงานราชการ (A4 Landscape)
        </button>
      </div>

      <div className="print-area">
        {/* Filters (No Print) */}
        <div className="card no-print mb-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-50 shadow-sm">
          <h3 className="text-base font-bold text-teal-800 mb-4 pb-2 border-b border-teal-100/50 flex items-center gap-2">
            <span className="text-lg">🔍</span> คัดกรองข้อมูลตรวจสอบ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ปีงบประมาณ</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="form-select w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ไตรมาส</label>
              <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} className="form-select w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500">
                <option value="ALL">รวมทั้งปีงบประมาณ</option>
                <option value="Q1">ไตรมาส 1 (ต.ค. - ธ.ค.)</option>
                <option value="Q2">ไตรมาส 2 (ม.ค. - มี.ค.)</option>
                <option value="Q3">ไตรมาส 3 (เม.ย. - มิ.ย.)</option>
                <option value="Q4">ไตรมาส 4 (ก.ค. - ก.ย.)</option>
              </select>
            </div>
            {role === "ADMIN" && (
              <div className="form-group">
                <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">กอง / หน่วยงาน</label>
                <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedVehicle("ALL"); }} className="form-select w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500">
                  <option value="ALL">ทั้งหมด (ทุกกอง/หน่วยงาน)</option>
                  {departments.map(d => <option key={d} value={d!}>{d}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ยานพาหนะเฉพาะคัน</label>
              <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="form-select w-full border-teal-300 bg-teal-50/50 rounded-xl focus:border-teal-500 focus:ring-teal-500">
                <option value="ALL">รวมรถทุกคัน</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.licensePlate} ({v.vehicleType})</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="text-base font-bold text-teal-800 mb-4 pb-2 border-b border-teal-100/50 flex items-center gap-2">
            <span className="text-lg">✍️</span> ข้อมูลผู้ลงนามในเอกสารควบคุม
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ชื่อผู้จัดทำรายงาน</label>
              <input type="text" value={reporterName} onChange={e => setReporterName(e.target.value)} className="form-input w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500" placeholder="นาย/นาง..." />
            </div>
             <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ตำแหน่งผู้จัดทำ</label>
              <input type="text" value={reporterPos} onChange={e => setReporterPos(e.target.value)} className="form-input w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500" placeholder="เจ้าพนักงาน..." />
            </div>
             <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ชื่อผู้ตรวจสอบ</label>
              <input type="text" value={reviewerName} onChange={e => setReviewerName(e.target.value)} className="form-input w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500" placeholder="นาย/นาง..." />
            </div>
             <div className="form-group">
              <label className="form-label text-slate-600 text-xs font-semibold mb-1.5 block">ตำแหน่งผู้ตรวจสอบ</label>
              <input type="text" value={reviewerPos} onChange={e => setReviewerPos(e.target.value)} className="form-input w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500" placeholder="ผู้อำนวยการ..." />
            </div>
          </div>
        </div>

        {/* Report Section Selection (Screen Only) */}
        <div className="tab-bar no-print mb-8">
          <div className="max-w-md">
            <label className="form-label text-slate-600 text-xs font-semibold mb-2 block">📑 เลือกส่วนของรายงานที่ต้องการแสดง</label>
            <div className="relative">
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)} 
                className="form-select w-full rounded-xl border-emerald-200 focus:border-teal-500 focus:ring-teal-500 text-teal-800 font-semibold bg-white shadow-sm cursor-pointer appearance-none py-3 px-4"
              >
                <option value="summary">📊 หน้าสรุป (ฟอร์มพัสดุ)</option>
                <option value="all">🗂 แสดงทั้งหมด (สำหรับจัดชุดพิมพ์)</option>
                <option value="part1">ส่วนที่ 1: ทรัพย์สินและค่าเสื่อม</option>
                <option value="part2">ส่วนที่ 2: สิ้นเปลืองเชื้อเพลิง</option>
                <option value="part3">ส่วนที่ 3: ประวัติซ่อมบำรุง</option>
                <option value="part4">ส่วนที่ 4: ประวัติการเดินทาง</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-teal-600">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards (Only Visible on Screen) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 dashboard-cards mb-8">
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">🚗</div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">รถที่แสดงผล</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{summary.vehiclesCount} คัน</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold">📍</div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">ระยะทางวิ่งรวม</div>
              <div className="text-xl font-bold text-teal-600 mt-0.5">{summary.distance.toLocaleString()} กม.</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">⛽</div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">รวมค่าน้ำมัน</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{summary.fuelCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">🔧</div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">รวมค่าซ่อมบำรุง</div>
              <div className="text-xl font-bold text-amber-600 mt-0.5">{summary.maintCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">💰</div>
            <div>
              <div className="text-xs text-red-700 font-bold uppercase tracking-wider">ค่าใช้จ่ายสุทธิ</div>
              <div className="text-xl font-black text-red-600 mt-0.5">{summary.totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿</div>
            </div>
          </div>
        </div>

        {/* -------------------- SUMMARY PART (NEW FORM) -------------------- */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 mb-8 print:mb-0 ${activeTab === 'all' ? 'print-section-break' : ''}`}>
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
              <div className="text-center w-72">
                <p>ลงชื่อ..........................................................ผู้จัดทำรายงาน</p>
                <p className="mt-4">( {reporterName || "เรวัฒน์ แพนพัฒน์"} )</p>
                <p className="mt-2">ตำแหน่ง {reporterPos || "เจ้าหน้าที่ กองช่าง"}</p>
              </div>
              <div className="text-center w-72">
                <p>ลงชื่อ..........................................................ผู้ตรวจสอบ</p>
                <p className="mt-4">( {reviewerName || "สรพงษ์ พัฒนะแสง"} )</p>
                <p className="mt-2">ตำแหน่ง {reviewerPos || "ผู้อำนวยการกองช่าง"}</p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PART 1 -------------------- */}
        {(activeTab === 'all' || activeTab === 'part1') && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 mb-8 print:mb-0">
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">
              <svg viewBox="0 0 200 200" className="w-16 h-16 fill-black mb-2 print:block hidden">
                <path d="M100 20 C102 24 105 28 108 30 C109 31 112 32 115 32 C118 32 121 31 123 29 C126 27 128 24 130 20 C128 25 125 30 121 34 C117 38 112 40 106 41 C108 43 111 46 114 48 C118 51 123 54 129 55 C135 56 142 56 148 54 C154 52 160 48 165 43 C162 48 158 53 152 57 C146 61 139 63 132 63 C135 65 138 68 141 71 C147 77 154 84 162 89 C170 94 179 97 188 98 C181 99 173 98 166 95 C159 92 152 87 146 81 C144 83 142 86 140 89 C136 95 132 102 128 109 C124 116 120 124 117 131 C114 138 111 146 109 154 C108 158 107 162 106 166 C105 162 104 158 103 154 C101 146 98 138 95 131 C92 124 88 116 84 109 C80 102 76 95 72 89 C70 86 68 83 66 81 C60 87 53 92 46 95 C39 98 31 99 24 98 C33 97 42 94 50 89 C58 84 65 77 71 71 C74 68 77 65 80 63 C73 63 66 61 60 57 C54 53 50 48 47 43 C52 48 58 52 64 54 C70 56 77 56 83 55 C89 54 94 51 98 48 C101 46 104 43 106 41 C100 40 95 38 91 34 C87 30 84 25 82 20 C84 24 86 27 89 29 C91 31 94 32 97 32 C100 32 103 31 104 30 C107 28 110 24 112 20 Z" />
                <path d="M100 65 L115 80 L130 90 L150 95 L170 98 L185 98 C180 94 172 88 163 80 C154 72 144 64 135 58 L125 53 C128 55 132 58 136 61 C144 67 153 74 162 82 C171 90 180 98 188 106 L180 107 C170 104 161 98 152 91 C143 84 135 77 127 70 L118 63 C120 66 123 70 126 74 C132 83 139 93 146 103 C153 113 160 123 167 133 L159 133 C151 124 144 114 137 104 C130 94 123 85 116 76 L110 68 C111 72 112 76 113 80 C114 91 115 102 116 113 C117 124 118 135 119 146 L111 146 C110 135 109 124 108 113 C107 102 106 91 105 80 L103 72 C103 76 103 80 103 84 C103 95 103 106 103 117 C103 128 103 139 103 150 L97 150 C97 139 97 128 97 117 C97 106 97 95 97 84 C97 80 97 76 97 72 L95 80 C94 91 93 102 92 113 C91 124 90 135 89 146 L81 146 C82 135 83 124 84 113 C85 102 86 91 87 80 C88 76 89 72 90 68 L84 76 C77 85 70 94 63 104 C56 114 49 124 41 133 L33 133 C40 123 47 113 54 103 C61 93 68 83 74 74 C77 70 80 66 82 63 L73 70 C65 77 57 84 48 91 C39 98 30 104 20 107 L12 106 C20 98 29 90 38 82 C47 74 56 67 64 61 C68 58 72 55 75 53 L65 58 C56 64 46 72 37 80 C28 88 20 94 15 98 L30 98 L50 95 L70 90 L85 80 L100 65 Z" />
                <path d="M90 120 C93 124 97 128 100 130 C103 128 107 124 110 120 C107 121 103 122 100 122 C97 122 93 121 90 120 Z M92 135 L100 145 L108 135 C105 137 102 138 100 138 C98 138 95 137 92 135 Z" />
              </svg>
              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 1: รายงานคุมยอดบัญชีทรัพย์สินยานพาหนะและการคำนวณค่าเสื่อมราคา</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ พ.ศ. {selectedYear} | ส่วนราชการ: {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "สรุปรวมทุกหน่วยงาน" : selectedDept}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="w-12 text-center py-3">ลำดับ</th>
                    <th className="text-center py-3">ทะเบียนรถ</th>
                    <th className="text-center py-3">ประเภทรถ</th>
                    <th className="text-center py-3">ยี่ห้อ / รุ่น</th>
                    <th className="text-center py-3">วันที่จดทะเบียน</th>
                    <th className="text-center py-3">อายุการใช้งาน (ปี)</th>
                    <th className="text-right py-3">ราคาทุนทรัพย์สิน (บาท)</th>
                    <th className="text-right py-3">ค่าเสื่อมราคาสะสม (บาท)</th>
                    <th className="text-right py-3">มูลค่าสุทธิตามบัญชี (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehiclesAssetData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">ไม่พบรายการข้อมูลทรัพย์สินตามเงื่อนไข</td>
                    </tr>
                  ) : (
                    vehiclesAssetData.map((v, i) => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="text-center py-3">{i + 1}</td>
                        <td className="text-center font-bold text-slate-800">{v.licensePlate}</td>
                        <td className="text-center">{v.vehicleType}</td>
                        <td className="text-center">{v.brand} {v.model}</td>
                        <td className="text-center">{new Date(v.registeredDate).toLocaleDateString("th-TH")}</td>
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
                      <td colSpan={6} className="text-center py-3 text-slate-800">รวมทั้งสิ้น</td>
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
          <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 mb-8 print:mb-0 ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">
              <svg viewBox="0 0 200 200" className="w-16 h-16 fill-black mb-2 print:block hidden">
                <path d="M100 20 C102 24 105 28 108 30 C109 31 112 32 115 32 C118 32 121 31 123 29 C126 27 128 24 130 20 C128 25 125 30 121 34 C117 38 112 40 106 41 C108 43 111 46 114 48 C118 51 123 54 129 55 C135 56 142 56 148 54 C154 52 160 48 165 43 C162 48 158 53 152 57 C146 61 139 63 132 63 C135 65 138 68 141 71 C147 77 154 84 162 89 C170 94 179 97 188 98 C181 99 173 98 166 95 C159 92 152 87 146 81 C144 83 142 86 140 89 C136 95 132 102 128 109 C124 116 120 124 117 131 C114 138 111 146 109 154 C108 158 107 162 106 166 C105 162 104 158 103 154 C101 146 98 138 95 131 C92 124 88 116 84 109 C80 102 76 95 72 89 C70 86 68 83 66 81 C60 87 53 92 46 95 C39 98 31 99 24 98 C33 97 42 94 50 89 C58 84 65 77 71 71 C74 68 77 65 80 63 C73 63 66 61 60 57 C54 53 50 48 47 43 C52 48 58 52 64 54 C70 56 77 56 83 55 C89 54 94 51 98 48 C101 46 104 43 106 41 C100 40 95 38 91 34 C87 30 84 25 82 20 C84 24 86 27 89 29 C91 31 94 32 97 32 C100 32 103 31 104 30 C107 28 110 24 112 20 Z" />
                <path d="M100 65 L115 80 L130 90 L150 95 L170 98 L185 98 C180 94 172 88 163 80 C154 72 144 64 135 58 L125 53 C128 55 132 58 136 61 C144 67 153 74 162 82 C171 90 180 98 188 106 L180 107 C170 104 161 98 152 91 C143 84 135 77 127 70 L118 63 C120 66 123 70 126 74 C132 83 139 93 146 103 C153 113 160 123 167 133 L159 133 C151 124 144 114 137 104 C130 94 123 85 116 76 L110 68 C111 72 112 76 113 80 C114 91 115 102 116 113 C117 124 118 135 119 146 L111 146 C110 135 109 124 108 113 C107 102 106 91 105 80 L103 72 C103 76 103 80 103 84 C103 95 103 106 103 117 C103 128 103 139 103 150 L97 150 C97 139 97 128 97 117 C97 106 97 95 97 84 C97 80 97 76 97 72 L95 80 C94 91 93 102 92 113 C91 124 90 135 89 146 L81 146 C82 135 83 124 84 113 C85 102 86 91 87 80 C88 76 89 72 90 68 L84 76 C77 85 70 94 63 104 C56 114 49 124 41 133 L33 133 C40 123 47 113 54 103 C61 93 68 83 74 74 C77 70 80 66 82 63 L73 70 C65 77 57 84 48 91 C39 98 30 104 20 107 L12 106 C20 98 29 90 38 82 C47 74 56 67 64 61 C68 58 72 55 75 53 L65 58 C56 64 46 72 37 80 C28 88 20 94 15 98 L30 98 L50 95 L70 90 L85 80 L100 65 Z" />
                <path d="M90 120 C93 124 97 128 100 130 C103 128 107 124 110 120 C107 121 103 122 100 122 C97 122 93 121 90 120 Z M92 135 L100 145 L108 135 C105 137 102 138 100 138 C98 138 95 137 92 135 Z" />
              </svg>
              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 2: รายงานรายละเอียดค่าน้ำมันเชื้อเพลิงและการตรวจสอบอัตราสิ้นเปลือง</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ พ.ศ. {selectedYear} | ส่วนราชการ: {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "สรุปรวมทุกหน่วยงาน" : selectedDept}
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
                          <td className="text-center">{new Date(l.fuelDate).toLocaleDateString("th-TH")}</td>
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
          <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 mb-8 print:mb-0 ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">
              <svg viewBox="0 0 200 200" className="w-16 h-16 fill-black mb-2 print:block hidden">
                <path d="M100 20 C102 24 105 28 108 30 C109 31 112 32 115 32 C118 32 121 31 123 29 C126 27 128 24 130 20 C128 25 125 30 121 34 C117 38 112 40 106 41 C108 43 111 46 114 48 C118 51 123 54 129 55 C135 56 142 56 148 54 C154 52 160 48 165 43 C162 48 158 53 152 57 C146 61 139 63 132 63 C135 65 138 68 141 71 C147 77 154 84 162 89 C170 94 179 97 188 98 C181 99 173 98 166 95 C159 92 152 87 146 81 C144 83 142 86 140 89 C136 95 132 102 128 109 C124 116 120 124 117 131 C114 138 111 146 109 154 C108 158 107 162 106 166 C105 162 104 158 103 154 C101 146 98 138 95 131 C92 124 88 116 84 109 C80 102 76 95 72 89 C70 86 68 83 66 81 C60 87 53 92 46 95 C39 98 31 99 24 98 C33 97 42 94 50 89 C58 84 65 77 71 71 C74 68 77 65 80 63 C73 63 66 61 60 57 C54 53 50 48 47 43 C52 48 58 52 64 54 C70 56 77 56 83 55 C89 54 94 51 98 48 C101 46 104 43 106 41 C100 40 95 38 91 34 C87 30 84 25 82 20 C84 24 86 27 89 29 C91 31 94 32 97 32 C100 32 103 31 104 30 C107 28 110 24 112 20 Z" />
                <path d="M100 65 L115 80 L130 90 L150 95 L170 98 L185 98 C180 94 172 88 163 80 C154 72 144 64 135 58 L125 53 C128 55 132 58 136 61 C144 67 153 74 162 82 C171 90 180 98 188 106 L180 107 C170 104 161 98 152 91 C143 84 135 77 127 70 L118 63 C120 66 123 70 126 74 C132 83 139 93 146 103 C153 113 160 123 167 133 L159 133 C151 124 144 114 137 104 C130 94 123 85 116 76 L110 68 C111 72 112 76 113 80 C114 91 115 102 116 113 C117 124 118 135 119 146 L111 146 C110 135 109 124 108 113 C107 102 106 91 105 80 L103 72 C103 76 103 80 103 84 C103 95 103 106 103 117 C103 128 103 139 103 150 L97 150 C97 139 97 128 97 117 C97 106 97 95 97 84 C97 80 97 76 97 72 L95 80 C94 91 93 102 92 113 C91 124 90 135 89 146 L81 146 C82 135 83 124 84 113 C85 102 86 91 87 80 C88 76 89 72 90 68 L84 76 C77 85 70 94 63 104 C56 114 49 124 41 133 L33 133 C40 123 47 113 54 103 C61 93 68 83 74 74 C77 70 80 66 82 63 L73 70 C65 77 57 84 48 91 C39 98 30 104 20 107 L12 106 C20 98 29 90 38 82 C47 74 56 67 64 61 C68 58 72 55 75 53 L65 58 C56 64 46 72 37 80 C28 88 20 94 15 98 L30 98 L50 95 L70 90 L85 80 L100 65 Z" />
                <path d="M90 120 C93 124 97 128 100 130 C103 128 107 124 110 120 C107 121 103 122 100 122 C97 122 93 121 90 120 Z M92 135 L100 145 L108 135 C105 137 102 138 100 138 C98 138 95 137 92 135 Z" />
              </svg>
              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 3: รายงานคุมรายละเอียดการซ่อมบำรุงรักษา พัสดุ และอะไหล่ยานพาหนะ</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ พ.ศ. {selectedYear} | ส่วนราชการ: {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "สรุปรวมทุกหน่วยงาน" : selectedDept}
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
                        <td className="text-center">{new Date(l.maintenanceDate).toLocaleDateString("th-TH")}</td>
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
          <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 mb-8 print:mb-0 ${activeTab === 'all' ? 'print-section-break' : ''}`}>
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center">
              <svg viewBox="0 0 200 200" className="w-16 h-16 fill-black mb-2 print:block hidden">
                <path d="M100 20 C102 24 105 28 108 30 C109 31 112 32 115 32 C118 32 121 31 123 29 C126 27 128 24 130 20 C128 25 125 30 121 34 C117 38 112 40 106 41 C108 43 111 46 114 48 C118 51 123 54 129 55 C135 56 142 56 148 54 C154 52 160 48 165 43 C162 48 158 53 152 57 C146 61 139 63 132 63 C135 65 138 68 141 71 C147 77 154 84 162 89 C170 94 179 97 188 98 C181 99 173 98 166 95 C159 92 152 87 146 81 C144 83 142 86 140 89 C136 95 132 102 128 109 C124 116 120 124 117 131 C114 138 111 146 109 154 C108 158 107 162 106 166 C105 162 104 158 103 154 C101 146 98 138 95 131 C92 124 88 116 84 109 C80 102 76 95 72 89 C70 86 68 83 66 81 C60 87 53 92 46 95 C39 98 31 99 24 98 C33 97 42 94 50 89 C58 84 65 77 71 71 C74 68 77 65 80 63 C73 63 66 61 60 57 C54 53 50 48 47 43 C52 48 58 52 64 54 C70 56 77 56 83 55 C89 54 94 51 98 48 C101 46 104 43 106 41 C100 40 95 38 91 34 C87 30 84 25 82 20 C84 24 86 27 89 29 C91 31 94 32 97 32 C100 32 103 31 104 30 C107 28 110 24 112 20 Z" />
                <path d="M100 65 L115 80 L130 90 L150 95 L170 98 L185 98 C180 94 172 88 163 80 C154 72 144 64 135 58 L125 53 C128 55 132 58 136 61 C144 67 153 74 162 82 C171 90 180 98 188 106 L180 107 C170 104 161 98 152 91 C143 84 135 77 127 70 L118 63 C120 66 123 70 126 74 C132 83 139 93 146 103 C153 113 160 123 167 133 L159 133 C151 124 144 114 137 104 C130 94 123 85 116 76 L110 68 C111 72 112 76 113 80 C114 91 115 102 116 113 C117 124 118 135 119 146 L111 146 C110 135 109 124 108 113 C107 102 106 91 105 80 L103 72 C103 76 103 80 103 84 C103 95 103 106 103 117 C103 128 103 139 103 150 L97 150 C97 139 97 128 97 117 C97 106 97 95 97 84 C97 80 97 76 97 72 L95 80 C94 91 93 102 92 113 C91 124 90 135 89 146 L81 146 C82 135 83 124 84 113 C85 102 86 91 87 80 C88 76 89 72 90 68 L84 76 C77 85 70 94 63 104 C56 114 49 124 41 133 L33 133 C40 123 47 113 54 103 C61 93 68 83 74 74 C77 70 80 66 82 63 L73 70 C65 77 57 84 48 91 C39 98 30 104 20 107 L12 106 C20 98 29 90 38 82 C47 74 56 67 64 61 C68 58 72 55 75 53 L65 58 C56 64 46 72 37 80 C28 88 20 94 15 98 L30 98 L50 95 L70 90 L85 80 L100 65 Z" />
                <path d="M90 120 C93 124 97 128 100 130 C103 128 107 124 110 120 C107 121 103 122 100 122 C97 122 93 121 90 120 Z M92 135 L100 145 L108 135 C105 137 102 138 100 138 C98 138 95 137 92 135 Z" />
              </svg>
              <h2 className="text-xl font-bold text-teal-900 print:text-black">ส่วนที่ 4: รายงานประวัติการใช้ยานพาหนะและบันทึกระยะทางการเดินทางราชการ</h2>
              <p className="text-slate-500 text-sm mt-1 print:text-black">
                ประจำปีงบประมาณ พ.ศ. {selectedYear} | ส่วนราชการ: {role !== "ADMIN" ? (department || "กอง") : selectedDept === "ALL" ? "สรุปรวมทุกหน่วยงาน" : selectedDept}
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
                        <td className="text-center">{new Date(l.travelDate).toLocaleDateString("th-TH")}</td>
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
    </>
  );
}
