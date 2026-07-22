import React from 'react';
import { FileText, MapPin, Upload, Building2, Phone, User, CheckCircle, ChevronRight, Info } from 'lucide-react';

export default function EPermitPublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-900/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-white">e-Permit</h1>
                <p className="text-xs text-blue-300 font-medium tracking-wide">ระบบขออนุญาตก่อสร้าง กองช่าง</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                ตรวจสอบสถานะ
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            บริการยื่นแบบออนไลน์ 24 ชม.
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 mb-6 drop-shadow-sm">
            ยื่นขออนุญาตก่อสร้าง <br className="hidden sm:block" />
            <span className="text-3xl md:text-4xl font-semibold opacity-90 mt-2 inline-block">สะดวกรวดเร็ว ไม่ต้องเดินทาง</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            ระบบรองรับการยื่นขอ อ.1, อ.6, และขออนุญาตขุดดิน/ถมดิน พร้อมติดตามสถานะได้ทันทีผ่านเบอร์โทรศัพท์
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 pb-24 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/50">
          <form className="space-y-8">
            
            {/* Section 1: ข้อมูลผู้ยื่น */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">1. ข้อมูลผู้ยื่นคำขอ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">ชื่อ-นามสกุล <span className="text-red-400">*</span></label>
                  <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500" placeholder="นายสมชาย ใจดี" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">เบอร์โทรศัพท์ (ใช้สำหรับติดตามเรื่อง) <span className="text-red-400">*</span></label>
                  <input type="tel" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500" placeholder="081-xxx-xxxx" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Line ID (ไม่บังคับ)</label>
                  <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500" placeholder="somchai.line" />
                </div>
              </div>
            </div>

            {/* Section 2: รายละเอียดการขออนุญาต */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">2. รายละเอียดการขออนุญาต</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">ประเภทใบอนุญาต <span className="text-red-400">*</span></label>
                  <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none cursor-pointer" required>
                    <option value="" className="bg-slate-800">-- เลือกประเภท --</option>
                    <option value="อ.1" className="bg-slate-800">ขออนุญาตก่อสร้างอาคาร (อ.1)</option>
                    <option value="อ.6" className="bg-slate-800">ขอรับรองการก่อสร้างอาคาร (อ.6)</option>
                    <option value="ขุดดิน" className="bg-slate-800">ขออนุญาตขุดดิน / ถมดิน</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">สถานที่ก่อสร้าง <span className="text-red-400">*</span></label>
                  <textarea className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-500 h-24 resize-none" placeholder="บ้านเลขที่, หมู่, ซอย, ถนน..." required></textarea>
                </div>
                
                {/* พิกัด (จำลอง) */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-3 rounded-full">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">พิกัดสถานที่ก่อสร้าง</h4>
                      <p className="text-sm text-slate-400">ละติจูด: 14.1234, ลองจิจูด: 100.5678</p>
                    </div>
                  </div>
                  <button type="button" className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all text-sm font-medium whitespace-nowrap">
                    ปักหมุดบนแผนที่ (GIS)
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: เอกสารแนบ */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="bg-pink-500/20 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">3. อัปโหลดเอกสาร</h3>
              </div>
              
              <div className="border-2 border-dashed border-white/10 hover:border-pink-500/50 bg-black/10 rounded-2xl p-10 text-center transition-colors cursor-pointer group">
                <div className="bg-pink-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-pink-400" />
                </div>
                <h4 className="text-white font-medium text-lg mb-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด</h4>
                <p className="text-slate-400 text-sm">รองรับไฟล์ PDF, AutoCAD (.dwg), JPG, PNG (ขนาดไม่เกิน 50MB)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button type="button" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group">
                <span>ยื่นคำขออนุญาตก่อสร้าง</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-slate-400 text-sm mt-4 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                ข้อมูลของท่านจะถูกเก็บรักษาเป็นความลับตามนโยบาย PDPA
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
