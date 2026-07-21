'use client';

import { useState } from 'react';
import Link from 'next/link';

const PROBLEM_TYPES = ['ถนน/ทางเดิน', 'ไฟฟ้าสาธารณะ', 'ท่อระบายน้ำ', 'ต้นไม้/สิ่งกีดขวาง', 'อื่นๆ'];

export default function ReportPage() {
  const [form, setForm] = useState({ problem_type: '', location: '', description: '', contact_name: '', contact_phone: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tracking_number: string } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.problem_type || !form.location || !form.description || !form.contact_name || !form.contact_phone) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/citizen-reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom, #1d4ed8, #0f172a)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-2xl font-black text-white mb-2">แจ้งปัญหาสำเร็จ!</h2>
          <p className="text-blue-200 mb-4">เลขติดตาม:</p>
          <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 mb-6">
            <p className="text-3xl font-black text-amber-400 tracking-widest">{result.tracking_number}</p>
          </div>
          <p className="text-white/60 text-sm mb-6">บันทึกเลขนี้ไว้เพื่อติดตามสถานะ</p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link href="/public/track" className="block bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-center">ติดตามสถานะ</Link>
            <Link href="/public" className="block text-white/60 text-sm text-center">กลับหน้าหลัก</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #1d4ed8, #0f172a)' }}>
      <div className="px-4 pt-8 pb-4">
        <Link href="/public" className="text-blue-300 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-black text-white mt-2">📣 แจ้งปัญหา</h1>
        <p className="text-blue-200 text-sm">ถนน ไฟฟ้า ท่อระบาย และสาธารณูปโภค</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-10 space-y-4">
        <div>
          <label className="text-white/80 text-sm font-semibold block mb-1.5">ประเภทปัญหา *</label>
          <div className="grid grid-cols-2 gap-2">
            {PROBLEM_TYPES.map(t => (
              <button key={t} type="button"
                onClick={() => setForm(f => ({ ...f, problem_type: t }))}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${form.problem_type === t ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 border border-white/20'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {(['location', 'description', 'contact_name', 'contact_phone'] as const).map((field) => (
          <div key={field}>
            <label className="text-white/80 text-sm font-semibold block mb-1.5">
              {{ location: 'สถานที่เกิดเหตุ *', description: 'รายละเอียด *', contact_name: 'ชื่อผู้แจ้ง *', contact_phone: 'เบอร์โทรศัพท์ *' }[field]}
            </label>
            {field === 'description' ? (
              <textarea rows={3} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-white text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            ) : (
              <input type={field === 'contact_phone' ? 'tel' : 'text'} value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-white text-sm"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            )}
          </div>
        ))}

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl font-black text-white text-lg mt-2 disabled:opacity-50 transition-all active:scale-95"
          style={{ background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(to right, #3b82f6, #6366f1)' }}>
          {loading ? '⏳ กำลังส่ง...' : '📤 ส่งเรื่อง'}
        </button>
      </form>
    </div>
  );
}
