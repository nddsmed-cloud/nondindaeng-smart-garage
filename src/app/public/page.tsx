'use client';

import Link from 'next/link';

const SERVICES = [
  {
    href: '/public/report',
    icon: '📣',
    label: 'แจ้งปัญหา',
    desc: 'ถนน ไฟฟ้า ท่อระบาย ฯลฯ',
    bg: 'from-blue-500 to-indigo-600',
  },
  {
    href: '/public/track',
    icon: '🔍',
    label: 'ติดตามสถานะ',
    desc: 'เช็กความคืบหน้าเรื่องที่แจ้ง',
    bg: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/public/permit',
    icon: '🏗️',
    label: 'ขออนุญาตก่อสร้าง',
    desc: 'ยื่นคำขอ อ.1 ออนไลน์',
    bg: 'from-amber-500 to-orange-500',
  },
  {
    href: '/public/contact',
    icon: '📞',
    label: 'ติดต่อเจ้าหน้าที่',
    desc: 'เบอร์โทร / แผนที่กองช่าง',
    bg: 'from-slate-500 to-slate-600',
  },
];

export default function CitizenPortal() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom, #1d4ed8, #312e81, #0f172a)' }}>
      {/* Header */}
      <header className="px-5 pt-12 pb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
          🏛️
        </div>
        <h1 className="text-2xl font-black text-white leading-tight">กองช่าง</h1>
        <p className="text-sm mt-1" style={{ color: '#93c5fd' }}>เทศบาลตำบลโนนดินแดง</p>
        <div className="inline-flex items-center gap-2 mt-4 rounded-full px-4 py-1.5" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>จันทร์–ศุกร์ · 08:30–16:30 น.</span>
        </div>
      </header>

      {/* Service grid */}
      <main className="flex-1 px-4 pb-10">
        <p className="text-xs font-semibold text-center uppercase tracking-widest mb-5" style={{ color: 'rgba(147,197,253,0.7)' }}>
          บริการออนไลน์
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {SERVICES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`relative flex flex-col items-center justify-center gap-2 py-7 px-3 rounded-2xl bg-gradient-to-br ${s.bg} shadow-xl active:scale-95 transition-all duration-150 overflow-hidden`}
            >
              <span className="text-4xl drop-shadow">{s.icon}</span>
              <span className="text-white font-black text-sm text-center leading-tight">{s.label}</span>
              <span className="text-xs text-center leading-tight px-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.desc}</span>
            </Link>
          ))}
        </div>

        {/* Emergency */}
        <div className="max-w-sm mx-auto mt-5">
          <a href="tel:044602148" className="flex items-center justify-between w-full rounded-2xl px-5 py-4 transition-colors" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#fca5a5' }}>แจ้งเหตุฉุกเฉิน</p>
              <p className="text-white font-black text-lg tracking-wide">044-602-148</p>
            </div>
            <span className="text-3xl">🚨</span>
          </a>
        </div>
      </main>

      {/* Staff login */}
      <footer className="text-center pb-8">
        <Link href="/login" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}>
          เข้าสู่ระบบเจ้าหน้าที่
        </Link>
      </footer>
    </div>
  );
}
