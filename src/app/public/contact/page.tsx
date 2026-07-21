'use client';

import Link from 'next/link';

const CONTACTS = [
  { label: 'กองช่าง', phone: '044-602-148', icon: '🏛️' },
  { label: 'สายด่วนฉุกเฉิน', phone: '044-602-148', icon: '🚨' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}>
      <div className="px-4 pt-8 pb-4">
        <Link href="/public" className="text-slate-300 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-black text-white mt-2">📞 ติดต่อเจ้าหน้าที่</h1>
        <p className="text-slate-400 text-sm">กองช่าง เทศบาลตำบลโนนดินแดง</p>
      </div>

      <div className="px-4 space-y-3 mb-6">
        {CONTACTS.map((c) => (
          <a key={c.label} href={`tel:${c.phone.replace(/-/g, '')}`}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span className="text-3xl">{c.icon}</span>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest">{c.label}</p>
              <p className="text-white font-black text-xl tracking-wide">{c.phone}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="px-4">
        <div className="rounded-2xl px-5 py-4 space-y-2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h3 className="text-white font-black">เวลาทำการ</h3>
          <p className="text-slate-300 text-sm">จันทร์ – ศุกร์</p>
          <p className="text-white font-bold text-lg">08:30 – 16:30 น.</p>
          <p className="text-slate-400 text-xs">(ยกเว้นวันหยุดราชการ)</p>
        </div>

        <div className="rounded-2xl px-5 py-4 mt-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h3 className="text-white font-black mb-2">ที่อยู่</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            เทศบาลตำบลโนนดินแดง<br />
            อ.โนนดินแดง จ.บุรีรัมย์ 31260
          </p>
        </div>
      </div>
    </div>
  );
}
