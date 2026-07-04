"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatThaiDate, formatThaiDateTime, getBangkokDateString } from "../../../lib/date-formatter";
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  RotateCcw, 
  Calendar, 
  User, 
  MapPin, 
  Truck, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { 
  updateVehicleRequestAction, 
  updateFuelLogStatusAction,
  bulkUpdateVehicleRequestsAction,
  bulkUpdateFuelLogsAction
} from "./actions";

type Vehicle = {
  id: string;
  licensePlate: string;
  province: string;
  vehicleType: string;
  bodyType: string;
  brand: string;
  model: string;
  status: string;
};

type VehicleRequest = {
  id: string;
  requesterName: string;
  department: string;
  purpose: string;
  vehicleType: string;
  travelDate: string;
  destination: string;
  status: string;
  note: string;
  vehicleId: string | null;
  startMileage: number | null;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: Vehicle | null;
};

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
  explanation: string;
  note: string;
  fuelStation: string;
  department: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle: Vehicle;
};

interface ApprovalsClientProps {
  initialVehicleRequests: VehicleRequest[];
  initialFuelLogs: FuelLog[];
  vehicles: Vehicle[];
  role: string;
  department: string;
}

export default function ApprovalsClient({
  initialVehicleRequests,
  initialFuelLogs,
  vehicles,
  role,
  department
}: ApprovalsClientProps) {
  const [activeTab, setActiveTab] = useState<"vehicle" | "fuel">("vehicle");
  
  // Local state for list items
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>(initialVehicleRequests);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("รออนุมัติ"); // Default to pending
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [selectedDate, setSelectedDate] = useState("");
  const [activePreset, setActivePreset] = useState("pending"); // Preset filter: pending, today, myDept, all

  // Selections for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Active Detail Panel
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);

  // Detail panel form state
  const [assignedVehicleId, setAssignedVehicleId] = useState("");
  const [startMileage, setStartMileage] = useState<number | "">("");
  const [noteText, setNoteText] = useState("");
  const [quickReason, setQuickReason] = useState("");

  // Toast & Undo State
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    action?: {
      label: string;
      onTrigger: () => void;
    };
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state with selected item when activeDetailId changes
  const activeDetailItem = activeTab === "vehicle" 
    ? vehicleRequests.find(r => r.id === activeDetailId)
    : fuelLogs.find(f => f.id === activeDetailId);

  useEffect(() => {
    if (activeDetailItem) {
      setNoteText(activeDetailItem.note || "");
      setQuickReason("");
      if (activeTab === "vehicle") {
        const vr = activeDetailItem as VehicleRequest;
        setAssignedVehicleId(vr.vehicleId || "");
        setStartMileage(vr.startMileage !== null ? vr.startMileage : "");
      }
    }
  }, [activeDetailId, activeTab]);

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
    setActiveDetailId(null);
  }, [activeTab]);

  // Trigger Toast Notification with Auto-dismiss
  const showToast = (message: string, undoAction?: () => void) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    
    const toastId = Math.random().toString();
    setToast({
      id: toastId,
      message,
      action: undoAction ? { label: "ย้อนกลับ", onTrigger: undoAction } : undefined
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Status Labels & Badges
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "รออนุมัติ":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "อนุมัติแล้ว":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ไม่อนุมัติ":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Quick reply presets
  const quickReasons = {
    approve: [
      "ข้อมูลครบถ้วน อนุมัติการเดินทาง",
      "รถและพนักงานขับรถพร้อมปฏิบัติหน้าที่",
      "อนุมัติวงเงินค่าเชื้อเพลิงตามจริง"
    ],
    reject: [
      "เนื่องจากรถไม่ว่างในวันเวลาดังกล่าว",
      "ข้อมูลไมล์เริ่มต้นและไมล์สิ้นสุดไม่สอดคล้อง",
      "เอกสารแนบไม่ครบถ้วน โปรดกรอกข้อมูลใหม่",
      "นอกเวลาราชการและไม่มีหนังสือขออนุมัติพิเศษ"
    ]
  };

  // Handle Preset Clicks
  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    if (preset === "all") {
      setSelectedStatus("ทั้งหมด");
      setSelectedDept("ทั้งหมด");
      setSelectedDate("");
    } else if (preset === "pending") {
      setSelectedStatus("รออนุมัติ");
      setSelectedDept("ทั้งหมด");
      setSelectedDate("");
    } else if (preset === "today") {
      setSelectedStatus("ทั้งหมด");
      setSelectedDept("ทั้งหมด");
      const todayStr = getBangkokDateString();
      setSelectedDate(todayStr);
    } else if (preset === "myDept") {
      setSelectedStatus("ทั้งหมด");
      setSelectedDept(department || "กองช่าง");
      setSelectedDate("");
    }
  };

  // Filter Logic
  const filteredVehicleRequests = vehicleRequests.filter(req => {
    const matchesSearch = [req.requesterName, req.purpose, req.destination, req.vehicleType]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "ทั้งหมด" || req.status === selectedStatus;
    const matchesDept = selectedDept === "ทั้งหมด" || req.department === selectedDept;
    
    // Travel date format match (e.g. "2026-07-04" or similar string in DB)
    const matchesDate = !selectedDate || req.travelDate.includes(selectedDate);

    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  const filteredFuelLogs = fuelLogs.filter(log => {
    const matchesSearch = [log.vehicle.licensePlate, log.fuelStation, log.vehicle.brand, log.explanation, log.note]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "ทั้งหมด" || log.status === selectedStatus;
    const matchesDept = selectedDept === "ทั้งหมด" || log.department === selectedDept;
    const matchesDate = !selectedDate || log.fuelDate.includes(selectedDate);

    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  // Handle Checkbox Selection
  const handleSelectToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllToggle = (items: (VehicleRequest | FuelLog)[]) => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  // Perform Individual Approval/Rejection with Optimistic UI & Undo
  const handleProcessItem = async (
    id: string, 
    status: string, 
    customNote: string,
    vId?: string,
    vMileage?: number
  ) => {
    if (activeTab === "vehicle") {
      const originalItem = vehicleRequests.find(r => r.id === id);
      if (!originalItem) return;

      // Check validation
      if (status === "อนุมัติแล้ว" && !vId) {
        alert("กรุณาเลือกรถยนต์ส่วนกลางที่จะจัดสรร");
        return;
      }

      // Revert action (Undo function)
      const undoAction = async () => {
        // Optimistic revert
        setVehicleRequests(prev => prev.map(item => 
          item.id === id ? { ...originalItem } : item
        ));
        
        await updateVehicleRequestAction(id, { 
          status: originalItem.status, 
          note: originalItem.note,
          vehicleId: originalItem.vehicleId || undefined,
          startMileage: originalItem.startMileage || undefined
        });
        showToast("↩️ ได้ทำการยกเลิกและคืนค่าคำขอเรียบร้อยแล้ว");
      };

      // Optimistic update
      setVehicleRequests(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status, 
          note: customNote,
          vehicleId: vId || null,
          startMileage: vMileage || null,
          vehicle: vehicles.find(v => v.id === vId) || null
        } : item
      ));

      setActiveDetailId(null);

      // Call action
      const result = await updateVehicleRequestAction(id, {
        status,
        note: customNote,
        vehicleId: vId,
        startMileage: vMileage
      });

      if (result.success) {
        showToast(`✅ อัปเดตสถานะคำขอของ "${originalItem.requesterName}" เป็น [${status}] สำเร็จ`, undoAction);
      } else {
        // Revert on failure
        setVehicleRequests(prev => prev.map(item => 
          item.id === id ? { ...originalItem } : item
        ));
        alert("เกิดข้อผิดพลาด: " + result.error);
      }

    } else {
      // Fuel Tab
      const originalItem = fuelLogs.find(f => f.id === id);
      if (!originalItem) return;

      const undoAction = async () => {
        setFuelLogs(prev => prev.map(item => 
          item.id === id ? { ...originalItem } : item
        ));
        await updateFuelLogStatusAction(id, originalItem.status, originalItem.note);
        showToast("↩️ ได้ทำการยกเลิกและคืนค่าการเติมน้ำมันเรียบร้อยแล้ว");
      };

      // Optimistic update
      setFuelLogs(prev => prev.map(item => 
        item.id === id ? { ...item, status, note: customNote } : item
      ));

      setActiveDetailId(null);

      const result = await updateFuelLogStatusAction(id, status, customNote);

      if (result.success) {
        showToast(`✅ อัปเดตสถานะการเติมน้ำมันรถ "${originalItem.vehicle.licensePlate}" เป็น [${status}] สำเร็จ`, undoAction);
      } else {
        setFuelLogs(prev => prev.map(item => 
          item.id === id ? { ...originalItem } : item
        ));
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    }
  };

  // Perform Bulk Operations
  const handleBulkProcess = async (status: string) => {
    const idsArray = Array.from(selectedIds);
    if (idsArray.length === 0) return;

    const confirmMsg = `ยืนยันการทำรายการ [${status}] ทั้งหมด ${idsArray.length} รายการที่เลือก?`;
    if (!confirm(confirmMsg)) return;

    if (activeTab === "vehicle") {
      const originalItems = [...vehicleRequests];
      
      // Optimistic update
      setVehicleRequests(prev => prev.map(item => 
        idsArray.includes(item.id) ? { ...item, status, note: "อนุมัติแบบกลุ่ม" } : item
      ));
      setSelectedIds(new Set());

      const result = await bulkUpdateVehicleRequestsAction(idsArray, status, "อนุมัติแบบกลุ่ม");
      if (result.success) {
        showToast(`✅ ปรับปรุงสถานะคำขอใช้รถแบบกลุ่ม ${idsArray.length} รายการเป็น [${status}] เรียบร้อย`);
      } else {
        // Revert on failure
        setVehicleRequests(originalItems);
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    } else {
      const originalItems = [...fuelLogs];

      // Optimistic update
      setFuelLogs(prev => prev.map(item => 
        idsArray.includes(item.id) ? { ...item, status, note: "อนุมัติแบบกลุ่ม" } : item
      ));
      setSelectedIds(new Set());

      const result = await bulkUpdateFuelLogsAction(idsArray, status, "อนุมัติแบบกลุ่ม");
      if (result.success) {
        showToast(`✅ ปรับปรุงสถานะการเติมน้ำมันแบบกลุ่ม ${idsArray.length} รายการเป็น [${status}] เรียบร้อย`);
      } else {
        setFuelLogs(originalItems);
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    }
  };

  // Filter Presets Options list
  const presetsList = [
    { id: "pending", label: "⏳ รอดำเนินการ" },
    { id: "today", label: "📅 วันนี้" },
    { id: "myDept", label: `🏢 กองของฉัน (${department || "กองช่าง"})` },
    { id: "all", label: "🌍 ทั้งหมด" }
  ];

  // List of departments to filter
  const departments = [
    "สำนักปลัดเทศบาล",
    "กองคลัง",
    "กองช่าง",
    "กองสาธารณสุขและสิ่งแวดล้อม",
    "กองการศึกษา",
    "กองสวัสดิการสังคม",
    "กองยุทธศาสตร์และงบประมาณ"
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-transparent min-h-screen">
      
      {/* 1. ส่วนหัวและสถิติ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">แดชบอร์ด</Link>
              <ChevronRight size={12} />
              <span className="text-slate-800">พิจารณาอนุมัติ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1 flex items-center gap-2">
              <ClipboardList className="text-blue-600" size={28} />
              กระดานพิจารณาอนุมัติ
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">พิจารณาและตรวจสอบคำขอใช้งานพาหนะเทศบาลและใบเบิกเชื้อเพลิง</p>
          </div>
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl font-bold text-xs md:text-sm border border-blue-100 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            บทบาท: {role === "ADMIN" ? "ผู้ดูแลระบบกลาง" : `ผอ. กอง${department}`}
          </div>
        </div>

        {/* สรุปสถิติแบบ Chip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-700 font-bold">⏳ รอดำเนินการ</div>
              <div className="text-xl font-extrabold text-amber-800 mt-0.5">
                {activeTab === "vehicle" 
                  ? vehicleRequests.filter(r => r.status === "รออนุมัติ").length
                  : fuelLogs.filter(f => f.status === "รออนุมัติ").length}
              </div>
            </div>
            <span className="text-lg">⏳</span>
          </div>

          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-700 font-bold">🔍 กำลังตรวจสอบ</div>
              <div className="text-xl font-extrabold text-blue-800 mt-0.5">
                {activeTab === "vehicle"
                  ? vehicleRequests.filter(r => r.status === "อยู่ระหว่างตรวจสอบ").length
                  : fuelLogs.filter(f => f.status === "อยู่ระหว่างตรวจสอบ").length}
              </div>
            </div>
            <span className="text-lg">🔍</span>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-700 font-bold">✅ อนุมัติแล้ว</div>
              <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
                {activeTab === "vehicle"
                  ? vehicleRequests.filter(r => r.status === "อนุมัติแล้ว").length
                  : fuelLogs.filter(f => f.status === "อนุมัติแล้ว").length}
              </div>
            </div>
            <span className="text-lg">✅</span>
          </div>

          <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-red-700 font-bold">❌ ปฏิเสธ</div>
              <div className="text-xl font-extrabold text-red-800 mt-0.5">
                {activeTab === "vehicle"
                  ? vehicleRequests.filter(r => r.status === "ไม่อนุมัติ").length
                  : fuelLogs.filter(f => f.status === "ไม่อนุมัติ").length}
              </div>
            </div>
            <span className="text-lg">❌</span>
          </div>
        </div>
      </div>

      {/* 2. แท็บสลับหน้า */}
      <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit mb-6 border border-slate-300/30 shadow-inner">
        <button
          onClick={() => setActiveTab("vehicle")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "vehicle"
              ? "bg-white text-blue-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🚗 คำขออนุมัติใช้รถ
          {vehicleRequests.filter(r => r.status === "รออนุมัติ").length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {vehicleRequests.filter(r => r.status === "รออนุมัติ").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("fuel")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "fuel"
              ? "bg-white text-blue-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ⛽ คำขอเติมน้ำมัน
          {fuelLogs.filter(f => f.status === "รออนุมัติ").length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {fuelLogs.filter(f => f.status === "รออนุมัติ").length}
            </span>
          )}
        </button>
      </div>

      {/* 3. แถบตัวกรองและค้นหา */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3 border-slate-100">
          <span className="text-xs text-slate-500 font-bold mr-2">ตัวกรองด่วน:</span>
          {presetsList.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activePreset === p.id 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search and Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={activeTab === "vehicle" ? "ค้นหาชื่อผู้ขอ, วัตถุประสงค์, ปลายทาง..." : "ค้นหาทะเบียนรถ, ปั๊มน้ำมัน, เหตุผล..."}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setActivePreset(""); }}
            >
              <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
              <option value="รออนุมัติ">⏳ รออนุมัติ</option>
              <option value="อยู่ระหว่างตรวจสอบ">🔍 อยู่ระหว่างตรวจสอบ</option>
              <option value="อนุมัติแล้ว">✅ ออนุมัติแล้ว</option>
              <option value="ไม่อนุมัติ">❌ ไม่อนุมัติ</option>
            </select>
          </div>

          <div className="flex gap-2">
            <select
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setActivePreset(""); }}
            >
              <option value="ทั้งหมด">กอง/สำนัก: ทั้งหมด</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {/* Clear Button */}
            {(searchQuery || selectedStatus !== "ทั้งหมด" || selectedDept !== "ทั้งหมด" || selectedDate) && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ทั้งหมด");
                  setSelectedDept("ทั้งหมด");
                  setSelectedDate("");
                  setActivePreset("all");
                }}
                className="p-2 border rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                title="ล้างการค้นหา"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg border border-blue-500 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="bg-white text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
              {selectedIds.size}
            </span>
            รายการที่เลือกอยู่
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkProcess("อนุมัติแล้ว")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow"
            >
              <Check size={14} /> อนุมัติกลุ่ม
            </button>
            <button
              onClick={() => handleBulkProcess("ไม่อนุมัติ")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow"
            >
              <X size={14} /> ปฏิเสธกลุ่ม
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="bg-transparent hover:bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* 4. พื้นที่แสดงผลแบบ 2 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column ซ้าย: รายการคำขอ (List) */}
        <div className={`lg:col-span-2 space-y-4`}>
          
          {/* VEHICLE TABS LIST */}
          {activeTab === "vehicle" && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={filteredVehicleRequests.length > 0 && selectedIds.size === filteredVehicleRequests.length}
                    onChange={() => handleSelectAllToggle(filteredVehicleRequests)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>เลือกทั้งหมดในสนามนี ({filteredVehicleRequests.length} รายการ)</span>
                </div>
              </div>

              {filteredVehicleRequests.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-200">
                  <div className="text-4xl">🎉</div>
                  <h3 className="font-bold text-slate-700 mt-2">ไม่พบคำขอใช้รถยนต์</h3>
                  <p className="text-slate-400 text-xs mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหาของคุณ</p>
                </div>
              ) : (
                filteredVehicleRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => setActiveDetailId(req.id)}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer relative ${
                      activeDetailId === req.id 
                        ? "border-blue-500 shadow-md ring-2 ring-blue-100" 
                        : "border-slate-200 shadow-sm hover:shadow"
                    } ${
                      req.status === "รออนุมัติ" ? "border-l-4 border-l-amber-500" : ""
                    } flex flex-col sm:flex-row gap-4 items-start justify-between`}
                  >
                    <div className="flex gap-3 items-start flex-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(req.id)}
                        onChange={() => handleSelectToggle(req.id)}
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="space-y-1 flex-1" onClick={() => setActiveDetailId(req.id)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 text-base">{req.requesterName}</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border">
                            {req.department}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Truck size={14} className="text-slate-400" />
                            <span><strong>ต้องการรถ:</strong> {req.vehicleType}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span><strong>เดินทาง:</strong> {formatThaiDate(req.travelDate)}</span>
                          </div>
                          {req.destination && (
                            <div className="flex items-center gap-1.5 sm:col-span-2">
                              <MapPin size={14} className="text-slate-400" />
                              <span className="line-clamp-1"><strong>จุดหมาย:</strong> {req.destination}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">"{req.purpose}"</p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end gap-2 self-stretch justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                      
                      {req.status === "รออนุมัติ" && (
                        <div className="flex gap-1.5 mt-1">
                          <button
                            onClick={() => setActiveDetailId(req.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded-lg text-xs font-semibold border border-blue-200 transition-all"
                            title="เปิดพิจารณาจัดสรรรถ"
                          >
                            📝 จัดสรร & อนุมัติ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* FUEL LOGS LIST */}
          {activeTab === "fuel" && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={filteredFuelLogs.length > 0 && selectedIds.size === filteredFuelLogs.length}
                    onChange={() => handleSelectAllToggle(filteredFuelLogs)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>เลือกทั้งหมดในสนามนี้ ({filteredFuelLogs.length} รายการ)</span>
                </div>
              </div>

              {filteredFuelLogs.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-200">
                  <div className="text-4xl">🎉</div>
                  <h3 className="font-bold text-slate-700 mt-2">ไม่พบคำขออนุมัติเติมน้ำมัน</h3>
                  <p className="text-slate-400 text-xs mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหาของคุณ</p>
                </div>
              ) : (
                filteredFuelLogs.map(log => (
                  <div
                    key={log.id}
                    onClick={() => setActiveDetailId(log.id)}
                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer relative ${
                      activeDetailId === log.id 
                        ? "border-blue-500 shadow-md ring-2 ring-blue-100" 
                        : "border-slate-200 shadow-sm hover:shadow"
                    } ${
                      log.status === "รออนุมัติ" ? "border-l-4 border-l-amber-500" : ""
                    } flex flex-col sm:flex-row gap-4 items-start justify-between`}
                  >
                    <div className="flex gap-3 items-start flex-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(log.id)}
                        onChange={() => handleSelectToggle(log.id)}
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="space-y-1 flex-1" onClick={() => setActiveDetailId(log.id)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 text-base">
                            🚗 {log.vehicle.licensePlate} — {log.vehicle.brand}
                          </h3>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border">
                            กอง{log.department}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                          <div>
                            <strong>เติมเชื้อเพลิง:</strong> <span className="text-blue-600 font-bold">{log.liters.toFixed(2)} ลิตร</span>
                          </div>
                          <div>
                            <strong>ยอดเงินจ่าย:</strong> <span className="text-emerald-600 font-bold">{log.totalCost.toLocaleString()} บาท</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span>วันที่เติม: {formatThaiDate(log.fuelDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" />
                            <span>ปั๊มน้ำมัน: {log.fuelStation || "-"}</span>
                          </div>
                        </div>
                        {log.explanation && (
                          <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 mt-1.5 w-fit font-medium">
                            ⚠️ {log.explanation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end gap-2 self-stretch justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(log.status)}`}>
                        {log.status}
                      </span>
                      
                      {log.status === "รออนุมัติ" && (
                        <div className="flex gap-1.5 mt-1">
                          <button
                            onClick={() => handleProcessItem(log.id, "อนุมัติแล้ว", "อนุมัติเรียบร้อย")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-lg text-xs font-bold transition-all shadow-sm"
                            title="อนุมัติทันที"
                          >
                            ✅ อนุมัติ
                          </button>
                          <button
                            onClick={() => setActiveDetailId(log.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1 rounded-lg text-xs font-bold border border-slate-300 transition-all"
                            title="เปิดพิจารณาใส่หมายเหตุ"
                          >
                            💬
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

        </div>

        {/* Column ขวา: แผงรายละเอียดด้านข้าง (Sticky Side Detail Panel) */}
        <div className="lg:col-span-1">
          
          {!activeDetailItem ? (
            <div className="bg-slate-100/60 border border-dashed border-slate-300 p-8 rounded-2xl text-center sticky top-6 text-slate-500 min-h-[350px] flex flex-col justify-center items-center">
              <ClipboardList size={36} className="text-slate-400 mb-2" />
              <p className="font-bold text-sm">ยังไม่ได้เลือกรายการ</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">คลิกเลือกการ์ดใบคำขอเพื่อเปิดแผงพิจารณาจัดสรรและอนุมัติแบบละเอียด</p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-6 space-y-4 max-h-[85vh] overflow-y-auto">
              
              {/* ส่วนหัวของ Panel */}
              <div className="flex justify-between items-start border-b pb-3 border-slate-100">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${getStatusBadgeClass(activeDetailItem.status)}`}>
                    {activeDetailItem.status}
                  </span>
                  <h2 className="text-base font-extrabold text-slate-800 mt-1">รายละเอียดการขออนุมัติ</h2>
                </div>
                <button
                  onClick={() => setActiveDetailId(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ข้อมูลเนื้อหาคำขอ */}
              {activeTab === "vehicle" ? (
                // --- รายละเอียดคำขอใช้รถยนต์ ---
                (() => {
                  const req = activeDetailItem as VehicleRequest;
                  return (
                    <div className="space-y-4 text-xs text-slate-600">
                      <div className="bg-slate-50 p-3.5 rounded-xl border space-y-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <User size={14} className="text-blue-600" />
                          <span>{req.requesterName}</span>
                        </div>
                        <div><strong>แผนกผู้ขอ:</strong> {req.department}</div>
                        <div className="flex items-start gap-1">
                          <MapPin size={13} className="text-slate-400 mt-0.5" />
                          <span><strong>จุดหมาย:</strong> {req.destination || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span><strong>เดินทางวันที่:</strong> {formatThaiDate(req.travelDate)}</span>
                        </div>
                        <div><strong>ความต้องการรถ:</strong> {req.vehicleType}</div>
                        <div className="bg-white p-2 rounded border text-slate-500 italic">
                          "{req.purpose}"
                        </div>
                      </div>

                      {/* แบบฟอร์มการอนุมัติ (แสดงเฉพาะสถานะรออนุมัติ) */}
                      {req.status === "รออนุมัติ" ? (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <h4 className="font-bold text-slate-800 flex items-center gap-1">
                            <Sparkles size={14} className="text-amber-500" />
                            จัดสรรรถยนต์และเลขไมล์เริ่มต้น
                          </h4>
                          
                          {/* จัดสรรรถยนต์ */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">เลือกรถยนต์ที่พร้อมใช้งาน *</label>
                            <select
                              className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              value={assignedVehicleId}
                              onChange={(e) => setAssignedVehicleId(e.target.value)}
                            >
                              <option value="">-- เลือกรถที่จะจัดสรร --</option>
                              {vehicles
                                .filter(v => v.status === "พร้อมใช้งาน")
                                .map(v => (
                                  <option key={v.id} value={v.id}>
                                    🚗 {v.licensePlate} ({v.province}) - {v.brand} {v.model}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* เลขไมล์เริ่มต้น */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">เลขไมล์เริ่มต้น (กม.)</label>
                            <input
                              type="number"
                              placeholder="เช่น 45200"
                              className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={startMileage}
                              onChange={(e) => setStartMileage(e.target.value ? parseInt(e.target.value) : "")}
                            />
                          </div>

                          {/* Dropdown เหตุผลด่วน */}
                          <div className="space-y-1 pt-1">
                            <label className="block text-[11px] font-bold text-slate-700">Template / เหตุผลด่วน</label>
                            <select
                              className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none bg-slate-50"
                              value={quickReason}
                              onChange={(e) => {
                                setQuickReason(e.target.value);
                                if (e.target.value) setNoteText(e.target.value);
                              }}
                            >
                              <option value="">-- เลือกข้อความมาตรฐาน --</option>
                              <optgroup label="✅ การอนุมัติ">
                                {quickReasons.approve.map((r, i) => (
                                  <option key={`a-${i}`} value={r}>{r}</option>
                                ))}
                              </optgroup>
                              <optgroup label="❌ การปฏิเสธ / แก้ไข">
                                {quickReasons.reject.map((r, i) => (
                                  <option key={`r-${i}`} value={r}>{r}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          {/* หมายเหตุ */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">หมายเหตุของผู้อนุมัติ</label>
                            <textarea
                              placeholder="กรอกเหตุผลเพิ่มเติม..."
                              rows={2}
                              className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            ></textarea>
                          </div>

                          {/* แถบปุ่ม Action */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={() => handleProcessItem(
                                req.id, 
                                "อนุมัติแล้ว", 
                                noteText,
                                assignedVehicleId,
                                typeof startMileage === "number" ? startMileage : undefined
                              )}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-[11px]"
                            >
                              <Check size={14} /> อนุมัติคำขอ
                            </button>
                            <button
                              onClick={() => handleProcessItem(req.id, "ไม่อนุมัติ", noteText)}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-[11px]"
                            >
                              <X size={14} /> ไม่อนุมัติคำขอ
                            </button>
                            <button
                              onClick={() => handleProcessItem(req.id, "อยู่ระหว่างตรวจสอบ", noteText)}
                              className="col-span-2 bg-blue-50 hover:bg-blue-100 text-blue-800 py-2 rounded-lg font-bold border border-blue-200 transition-all text-center text-[11px]"
                            >
                              🔍 ส่งกลับเพื่อขอข้อมูลเพิ่ม / ตรวจสอบ
                            </button>
                          </div>

                        </div>
                      ) : (
                        // แสดงประวัติสรุปการอนุมัติเดิม
                        <div className="pt-2 border-t space-y-2">
                          <h4 className="font-bold text-slate-800">สรุปผลการจัดสรร</h4>
                          {req.vehicle && (
                            <div className="bg-slate-100 p-2.5 rounded-lg border">
                              <strong>รถที่ได้รับจัดสรร:</strong> {req.vehicle.licensePlate} ({req.vehicle.province}) - {req.vehicle.brand} {req.vehicle.model}
                              {req.startMileage !== null && (
                                <div className="mt-1"><strong>เลขไมล์เริ่มต้น:</strong> {req.startMileage.toLocaleString()} กม.</div>
                              )}
                            </div>
                          )}
                          {req.note && (
                            <div className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded">
                              "หมายเหตุ: {req.note}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timeline การพิจารณาอนุมัติ */}
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <h4 className="font-bold text-slate-800">ประวัติกิจกรรมคำขอ (Timeline)</h4>
                        <div className="relative border-l-2 border-slate-200 pl-4 space-y-3.5 pt-1">
                          <div className="relative">
                            <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
                            <div className="font-bold text-slate-800 text-[10px]">สร้างคำขอใช้รถยนต์</div>
                            <div className="text-[9px] text-slate-400">สร้างเมื่อ: {formatThaiDateTime(req.createdAt)}</div>
                          </div>
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                              req.status === "รออนุมัติ" ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                            }`}></span>
                            <div className="font-bold text-slate-800 text-[10px]">ส่งเรื่องให้ ผอ. คัดกรองและจัดสรร</div>
                            <div className="text-[9px] text-slate-400">สถานะ: {req.status}</div>
                          </div>
                          {req.status !== "รออนุมัติ" && (
                            <div className="relative">
                              <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                                req.status === "อนุมัติแล้ว" ? "bg-emerald-500" : "bg-red-500"
                              }`}></span>
                              <div className="font-bold text-slate-800 text-[10px]">สรุปผลการพิจารณา</div>
                              <div className="text-[9px] text-slate-400">เมื่อ: {formatThaiDateTime(req.updatedAt)}</div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()
              ) : (
                // --- รายละเอียดคำขอเติมน้ำมัน ---
                (() => {
                  const log = activeDetailItem as FuelLog;
                  return (
                    <div className="space-y-4 text-xs text-slate-600">
                      <div className="bg-slate-50 p-3.5 rounded-xl border space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <span>🚗 {log.vehicle.licensePlate}</span>
                          <span className="text-slate-400">({log.vehicle.brand} {log.vehicle.model})</span>
                        </div>
                        <div><strong>หน่วยงานผู้ขอ:</strong> กอง{log.department || "-"}</div>
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span><strong>วันที่เติมน้ำมัน:</strong> {formatThaiDate(log.fuelDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span><strong>ปั๊มน้ำมัน:</strong> {log.fuelStation || "-"}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border border-slate-100 mt-2">
                          <div>
                            <div className="text-[10px] text-slate-400">ปริมาณน้ำมัน:</div>
                            <div className="font-bold text-slate-800">{log.liters.toFixed(2)} ลิตร</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">ค่าใช้จ่ายรวม:</div>
                            <div className="font-bold text-slate-800">{log.totalCost.toLocaleString()} บาท</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">ระยะทางวิ่งได้:</div>
                            <div className="font-bold text-slate-800">{log.distance.toLocaleString()} กม.</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">ช่วงเลขไมล์รถ:</div>
                            <div className="font-medium text-slate-700">{log.startMileage} → {log.endMileage}</div>
                          </div>
                        </div>
                        
                        {log.explanation && (
                          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100/50 mt-1">
                            <strong>คำอธิบายเพิ่มเติม:</strong> {log.explanation}
                          </div>
                        )}
                      </div>

                      {/* แบบฟอร์มอนุมัติเติมน้ำมัน (แสดงเฉพาะสถานะรออนุมัติ) */}
                      {log.status === "รออนุมัติ" ? (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <h4 className="font-bold text-slate-800">พิจารณาใบเบิกน้ำมัน</h4>

                          {/* Dropdown เหตุผลด่วน */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">Template / เหตุผลด่วน</label>
                            <select
                              className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none bg-slate-50"
                              value={quickReason}
                              onChange={(e) => {
                                setQuickReason(e.target.value);
                                if (e.target.value) setNoteText(e.target.value);
                              }}
                            >
                              <option value="">-- เลือกข้อความมาตรฐาน --</option>
                              <optgroup label="✅ การอนุมัติ">
                                {quickReasons.approve.map((r, i) => (
                                  <option key={`fa-${i}`} value={r}>{r}</option>
                                ))}
                              </optgroup>
                              <optgroup label="❌ การปฏิเสธ / แก้ไข">
                                {quickReasons.reject.map((r, i) => (
                                  <option key={`fr-${i}`} value={r}>{r}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          {/* หมายเหตุ */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">หมายเหตุของผู้อนุมัติ</label>
                            <textarea
                              placeholder="ใส่เหตุผลเพิ่มเติม..."
                              rows={2}
                              className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            ></textarea>
                          </div>

                          {/* แถบปุ่ม Action */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleProcessItem(log.id, "อนุมัติแล้ว", noteText)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-[11px]"
                            >
                              <Check size={14} /> อนุมัติใบเบิก
                            </button>
                            <button
                              onClick={() => handleProcessItem(log.id, "ไม่อนุมัติ", noteText)}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-[11px]"
                            >
                              <X size={14} /> ปฏิเสธใบเบิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t">
                          {log.note && (
                            <div className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded">
                              "หมายเหตุ: {log.note}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timeline คำขอเติมน้ำมัน */}
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <h4 className="font-bold text-slate-800">ประวัติกิจกรรมคำขอ (Timeline)</h4>
                        <div className="relative border-l-2 border-slate-200 pl-4 space-y-3.5 pt-1">
                          <div className="relative">
                            <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
                            <div className="font-bold text-slate-800 text-[10px]">บันทึกข้อมูลการเติมเชื้อเพลิง</div>
                            <div className="text-[9px] text-slate-400">เมื่อ: {formatThaiDateTime(log.createdAt)}</div>
                          </div>
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                              log.status === "รออนุมัติ" ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                            }`}></span>
                            <div className="font-bold text-slate-800 text-[10px]">ส่งเรื่องให้ผู้บังคับบัญชาอนุมัติ</div>
                            <div className="text-[9px] text-slate-400">สถานะ: {log.status}</div>
                          </div>
                          {log.status !== "รออนุมัติ" && (
                            <div className="relative">
                              <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                                log.status === "อนุมัติแล้ว" ? "bg-emerald-500" : "bg-red-500"
                              }`}></span>
                              <div className="font-bold text-slate-800 text-[10px]">สรุปผลการอนุมัติเติมเชื้อเพลิง</div>
                              <div className="text-[9px] text-slate-400">เมื่อ: {formatThaiDateTime(log.updatedAt)}</div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()
              )}

            </div>
          )}

        </div>

      </div>

      {/* 5. Undo Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-800 flex flex-col gap-2 min-w-[320px] max-w-[400px] z-50 animate-bounce-float">
          <div className="flex items-center justify-between gap-3 text-xs md:text-sm font-semibold">
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onTrigger();
                  setToast(null);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border border-blue-400 shadow flex items-center gap-1 active:scale-95"
              >
                <RotateCcw size={12} />
                {toast.action.label}
              </button>
            )}
          </div>
          {/* Progress bar countdown */}
          <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
            <div className="bg-blue-500 h-full animate-toast-progress"></div>
          </div>
        </div>
      )}

      {/* Styles for progress animation */}
      <style jsx global>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-progress {
          animation: toastProgress 6000ms linear forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>

    </div>
  );
}
