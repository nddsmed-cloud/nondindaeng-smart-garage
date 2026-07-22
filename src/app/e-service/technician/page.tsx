import React from 'react';
import { Camera, MapPin, CheckCircle, Navigation2, FileWarning, Clock, UploadCloud, ShieldAlert } from 'lucide-react';

export default function TechnicianMobileView() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans sm:max-w-md sm:mx-auto sm:border-x sm:border-slate-200 sm:shadow-2xl relative">
      
      {/* Mobile Header */}
      <div className="bg-amber-600 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">แอปพลิเคชันทีมช่าง (Mobile)</h1>
            <p className="text-xs text-amber-200">เข้าสู่ระบบ: นายเอก ช่างไฟฟ้า</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-4 pb-24">
        
        <h2 className="text-slate-800 font-bold flex items-center justify-between">
          <span>งานที่ได้รับมอบหมาย (Work Orders)</span>
          <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">1 งานใหม่</span>
        </h2>

        {/* Card: New Task */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-rose-500 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-rose-50">
            <div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider bg-white px-2 py-1 rounded-md shadow-sm border border-rose-100">ด่วนมาก</span>
              <h3 className="font-bold text-slate-800 mt-2 text-lg">RP2568-0042</h3>
              <p className="text-slate-600 text-sm font-medium">ถนนชำรุด (เป็นหลุมลึก)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 flex items-center justify-end gap-1"><Clock className="w-3 h-3"/> 10 นาทีที่แล้ว</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>ซอยเทศบาล 3 หน้าตลาดสด (หน้าป้อมตำรวจ)</span>
            </p>
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <FileWarning className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>หลุมขนาดใหญ่ รถจักรยานยนต์เกิดอุบัติเหตุบ่อยครั้ง ขอให้รีบนำยางมะตอยไปอุดชั่วคราว</span>
            </p>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm border border-blue-100 active:bg-blue-100 transition-colors">
                <Navigation2 className="w-4 h-4" /> นำทาง
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-500/30 active:bg-amber-600 transition-colors">
                กดรับงาน
              </button>
            </div>
          </div>
        </div>

        {/* Card: In Progress */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-blue-500 overflow-hidden opacity-90">
          <div className="p-4 border-b border-slate-100 bg-blue-50/50">
            <h3 className="font-bold text-slate-800">RP2568-0041</h3>
            <p className="text-slate-600 text-sm font-medium">ไฟฟ้าสาธารณะ (ไฟดับ)</p>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>ถนนหลัก หน้าโรงเรียน</span>
            </p>
            
            {/* Upload Area for Closing Job */}
            <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
              <div className="flex justify-center mb-2 text-slate-400">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">ถ่ายรูปภาพหลังแก้ไขเสร็จ</p>
              <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-medium mt-2 shadow-sm">
                เปิดกล้อง
              </button>
            </div>

            <button className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/30 active:bg-emerald-600 transition-colors">
              <CheckCircle className="w-5 h-5" /> ปิดงาน (แจ้งซ่อมเสร็จสิ้น)
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Tab Bar (Mock) */}
      <div className="fixed bottom-0 w-full sm:w-full sm:max-w-md bg-white border-t border-slate-200 flex justify-around p-3 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center gap-1 text-amber-600">
          <FileWarning className="w-6 h-6" />
          <span className="text-[10px] font-medium">งานของฉัน</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <CheckCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">ประวัติปิดงาน</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <UploadCloud className="w-6 h-6" />
          <span className="text-[10px] font-medium">ข้อมูลออฟไลน์</span>
        </button>
      </div>

    </div>
  );
}
