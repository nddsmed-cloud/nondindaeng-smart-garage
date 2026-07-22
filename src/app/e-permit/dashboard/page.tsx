import React from 'react';
import { Building2, Search, Filter, FileText, CheckCircle, XCircle, Clock, Eye, Download, UserCheck } from 'lucide-react';

export default function EPermitDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar (Mock) */}
      <div className="fixed w-64 h-full bg-slate-900 text-white p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <Building2 className="w-8 h-8 text-blue-400" />
          <h2 className="text-xl font-bold">e-Office<br/><span className="text-sm font-normal text-slate-400">กองช่าง</span></h2>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 bg-blue-600/20 text-blue-400 px-4 py-3 rounded-xl font-medium">
            <FileText className="w-5 h-5" /> ทะเบียนขออนุญาต
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white px-4 py-3 rounded-xl font-medium transition-colors">
            <CheckCircle className="w-5 h-5" /> อนุมัติใบอนุญาต (อ.1)
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">ทะเบียนขออนุญาตก่อสร้าง</h1>
            <p className="text-slate-500 mt-1">เจ้าหน้าที่กองช่าง ตรวจสอบและดำเนินการออกใบอนุญาต</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">นายสมชาย เจ้าหน้าที่</p>
              <p className="text-xs text-slate-500">ฝ่ายแบบแผนและก่อสร้าง</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'คำขอทั้งหมด', value: '128', icon: <FileText className="text-blue-500"/>, bg: 'bg-blue-50' },
            { label: 'รอตรวจสอบ', value: '12', icon: <Clock className="text-amber-500"/>, bg: 'bg-amber-50' },
            { label: 'อนุมัติแล้ว', value: '110', icon: <CheckCircle className="text-emerald-500"/>, bg: 'bg-emerald-50' },
            { label: 'ไม่อนุมัติ', value: '6', icon: <XCircle className="text-rose-500"/>, bg: 'bg-rose-50' },
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

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="ค้นหาชื่อ, เลขที่คำขอ..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50">
              <Filter className="w-4 h-4" /> กรองข้อมูล
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="py-4 px-6 font-medium">เลขที่คำขอ</th>
                <th className="py-4 px-6 font-medium">ชื่อผู้ขอ</th>
                <th className="py-4 px-6 font-medium">ประเภท</th>
                <th className="py-4 px-6 font-medium">วันที่ยื่น</th>
                <th className="py-4 px-6 font-medium">สถานะ</th>
                <th className="py-4 px-6 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Mock Data Row 1 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-slate-900">กช.012/2568</td>
                <td className="py-4 px-6 text-sm text-slate-600">นายสมชาย ใจดี<br/><span className="text-xs text-slate-400">081-234-5678</span></td>
                <td className="py-4 px-6 text-sm text-slate-600">อ.1 (ก่อสร้างบ้าน)</td>
                <td className="py-4 px-6 text-sm text-slate-600">21 ก.ค. 2568<br/><span className="text-xs text-slate-400">10:30 น.</span></td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> รอตรวจสอบ
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip" title="ดูรายละเอียด">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors tooltip" title="ดาวน์โหลดเอกสาร">
                    <Download className="w-5 h-5" />
                  </button>
                </td>
              </tr>
              {/* Mock Data Row 2 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-slate-900">กช.011/2568</td>
                <td className="py-4 px-6 text-sm text-slate-600">นางสาวสมหญิง รักดี<br/><span className="text-xs text-slate-400">089-876-5432</span></td>
                <td className="py-4 px-6 text-sm text-slate-600">อ.6 (รับรองอาคาร)</td>
                <td className="py-4 px-6 text-sm text-slate-600">20 ก.ค. 2568<br/><span className="text-xs text-slate-400">14:15 น.</span></td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> อนุมัติแล้ว
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors">
                    พิมพ์ใบอนุญาต
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>แสดง 1 - 10 จาก 128 รายการ</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">ก่อนหน้า</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">ถัดไป</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
