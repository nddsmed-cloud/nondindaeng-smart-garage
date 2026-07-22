import React from 'react';
import { HardHat, Search, Filter, AlertTriangle, CheckCircle2, Clock, MapPin, Send, Wrench, ChevronDown } from 'lucide-react';

export default function EServiceDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar (Mock) */}
      <div className="fixed w-64 h-full bg-slate-900 text-white p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <HardHat className="w-8 h-8 text-amber-400" />
          <h2 className="text-xl font-bold">e-Office<br/><span className="text-sm font-normal text-slate-400">ศูนย์รับแจ้งเหตุ กองช่าง</span></h2>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 bg-amber-600/20 text-amber-400 px-4 py-3 rounded-xl font-medium">
            <AlertTriangle className="w-5 h-5" /> รายการรับแจ้งซ่อม
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white px-4 py-3 rounded-xl font-medium transition-colors">
            <Wrench className="w-5 h-5" /> ติดตามสถานะช่าง
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">รายการแจ้งซ่อมสาธารณูปโภค</h1>
            <p className="text-slate-500 mt-1">หัวหน้าฝ่ายการโยธา ตรวจสอบและสั่งจ่ายงาน (Work Order)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">นายสมโภช หัวหน้าช่าง</p>
              <p className="text-xs text-slate-500">ฝ่ายการโยธา</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <HardHat className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'เรื่องร้องเรียนใหม่', value: '8', icon: <AlertTriangle className="text-rose-500"/>, bg: 'bg-rose-50' },
            { label: 'กำลังดำเนินการ', value: '15', icon: <Wrench className="text-amber-500"/>, bg: 'bg-amber-50' },
            { label: 'ซ่อมเสร็จแล้ว', value: '42', icon: <CheckCircle2 className="text-emerald-500"/>, bg: 'bg-emerald-50' },
            { label: 'รวมทั้งหมด', value: '65', icon: <Clock className="text-blue-500"/>, bg: 'bg-blue-50' },
          ].map((stat, idx) => (
            <div key={idx} className={`rounded-2xl p-6 ${stat.bg} border border-slate-100 flex items-center justify-between`}>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex gap-4 items-center justify-between bg-slate-50">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="ค้นหารหัส, สถานที่, หรือหมวดหมู่..." className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  รอจ่ายงาน <span className="bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-xs">8</span>
                </button>
              </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="py-4 px-6 font-medium">รหัสแจ้งซ่อม</th>
                <th className="py-4 px-6 font-medium">หมวดหมู่ / สถานที่</th>
                <th className="py-4 px-6 font-medium">วันที่รับแจ้ง</th>
                <th className="py-4 px-6 font-medium">สถานะ</th>
                <th className="py-4 px-6 font-medium">ผู้รับผิดชอบ</th>
                <th className="py-4 px-6 font-medium text-right">สั่งการช่าง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1 (Pending) */}
              <tr className="hover:bg-amber-50/50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-slate-900">
                  RP2568-0042
                  <div className="text-xs text-slate-500 font-normal mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> พิกัดแนบมา
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">
                  <span className="font-medium text-rose-600">ถนนชำรุด (เป็นหลุมลึก)</span><br/>
                  <span className="text-xs text-slate-500">ซอยเทศบาล 3 หน้าตลาดสด</span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">วันนี้<br/><span className="text-xs text-slate-400">09:15 น.</span></td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> รอสั่งการ (Pending)
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-500">
                  - ยังไม่ได้ระบุ -
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-amber-500/20">
                    <Send className="w-4 h-4" /> จ่ายงาน (Work Order)
                  </button>
                </td>
              </tr>
              
              {/* Row 2 (In Progress) */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-slate-900">RP2568-0041</td>
                <td className="py-4 px-6 text-sm text-slate-600">
                  <span className="font-medium text-blue-600">ไฟฟ้าสาธารณะ (ไฟดับ)</span><br/>
                  <span className="text-xs text-slate-500">ถนนหลัก หน้าโรงเรียน</span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">เมื่อวาน<br/><span className="text-xs text-slate-400">18:30 น.</span></td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> กำลังดำเนินการ
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-900 font-medium">
                  ทีมช่างไฟฟ้า A (นายเอก)
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    ติดตามงาน
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
