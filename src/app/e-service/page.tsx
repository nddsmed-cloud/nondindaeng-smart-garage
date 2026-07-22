import React from 'react';
import { AlertTriangle, MapPin, Camera, Wrench, Navigation, CheckCircle2, ChevronRight, HardHat, Info } from 'lucide-react';

export default function EServicePublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/40 to-slate-900 text-slate-100 font-sans selection:bg-amber-500/30">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-900/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <HardHat className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-white">e-Service</h1>
                <p className="text-xs text-amber-300 font-medium tracking-wide">แจ้งซ่อมสาธารณูปโภค กองช่าง</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                ติดตามเรื่อง
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-6">
            <AlertTriangle className="w-4 h-4" />
            ศูนย์รับแจ้งเหตุ กองช่าง 24 ชม.
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-500 mb-6 drop-shadow-sm">
            แจ้งปัญหา สาธารณูปโภค <br className="hidden sm:block" />
            <span className="text-3xl md:text-4xl font-semibold opacity-90 mt-2 inline-block text-white">รวดเร็ว ทันใจ ลงพื้นที่ไว</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            พบเห็น ไฟทางดับ ถนนพัง ท่อระบายน้ำอุดตัน แจ้งได้ทันที พร้อมแนบรูปและพิกัด GPS เพื่อให้ช่างเข้าแก้ไขได้อย่างแม่นยำ
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 pb-24 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/50">
          <form className="space-y-8">
            
            {/* Section 1: ข้อมูลผู้แจ้ง */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                ข้อมูลผู้แจ้ง
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">ชื่อ-นามสกุล <span className="text-red-400">*</span></label>
                  <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-500" placeholder="ชื่อผู้แจ้ง" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
                  <input type="tel" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-500" placeholder="081-xxx-xxxx" required />
                </div>
              </div>
            </div>

            {/* Section 2: รายละเอียดปัญหา */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                รายละเอียดที่พบเห็น
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Cards */}
                {['ไฟฟ้าสาธารณะ', 'ถนนชำรุด', 'ท่อระบายน้ำ', 'อาคาร/อื่นๆ'].map((cat, idx) => (
                  <label key={idx} className="cursor-pointer relative">
                    <input type="radio" name="category" className="peer sr-only" value={cat} required={idx === 0} />
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center hover:bg-white/5 transition-all peer-checked:bg-amber-500/20 peer-checked:border-amber-500/50 peer-checked:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Wrench className="w-6 h-6 mx-auto mb-2 text-slate-400 peer-checked:text-amber-400" />
                      <span className="text-sm font-medium text-slate-300 peer-checked:text-amber-300">{cat}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">อธิบายปัญหาเพิ่มเติม <span className="text-red-400">*</span></label>
                <textarea className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-500 h-24 resize-none" placeholder="เช่น หลอดไฟขาดตรงทางแยก, ถนนเป็นหลุมลึก..." required></textarea>
              </div>
            </div>

            {/* Section 3: ตำแหน่งและรูปภาพ */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                พิกัดและรูปภาพ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GPS Location */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Navigation className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">ตำแหน่งของคุณ</h4>
                    <p className="text-slate-400 text-sm mb-4">กดปุ่มด้านล่างเพื่อดึงพิกัดอัตโนมัติ</p>
                    <button type="button" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 w-full">
                      <MapPin className="w-4 h-4" /> ดึงพิกัด GPS ปัจจุบัน
                    </button>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-amber-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">ถ่ายภาพจุดเกิดเหตุ</h4>
                    <p className="text-slate-400 text-sm mb-4">รองรับการอัปโหลดหรือถ่ายภาพจากกล้อง</p>
                    <div className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors w-full inline-block">
                      อัปโหลดรูปภาพ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button type="button" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-900/50 transition-all flex items-center justify-center gap-2 group text-lg tracking-wide border border-amber-400/20">
                <span>ส่งเรื่องแจ้งซ่อม</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
