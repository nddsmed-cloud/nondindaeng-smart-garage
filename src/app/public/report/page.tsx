'use client';

import { useState } from 'react';
import Link from 'next/link';

const PROBLEM_TYPES = ['ถนน/ทางเดิน', 'ไฟฟ้าสาธารณะ', 'ท่อระบายน้ำ', 'ต้นไม้/สิ่งกีดขวาง', 'อื่นๆ'];

const FIELD_LABELS: Record<string, string> = {
  location: 'สถานที่เกิดเหตุ',
  description: 'รายละเอียดปัญหา',
  contact_name: 'ชื่อผู้แจ้ง',
  contact_phone: 'เบอร์โทรศัพท์',
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  location: 'เช่น หน้าบ้านเลขที่ 12 หมู่ 3',
  description: 'อธิบายลักษณะปัญหาที่พบ',
  contact_name: 'ชื่อ-นามสกุล',
  contact_phone: '08X-XXX-XXXX',
};

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

  // ------- หน้ายืนยันสำเร็จ -------
  if (result) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <span className="text-5xl">✅</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">แจ้งปัญหาสำเร็จ</h2>
          <p className="text-slate-500 text-base mb-5">เจ้าหน้าที่จะดำเนินการตรวจสอบโดยเร็วที่สุด</p>

          <p className="text-sm text-slate-500 mb-2">เลขที่ติดตามเรื่อง</p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4 mb-6">
            <p className="text-2xl sm:text-3xl font-black text-blue-700 tracking-widest break-all">{result.tracking_number}</p>
          </div>
          <p className="text-slate-400 text-sm mb-6">บันทึกเลขนี้ไว้เพื่อใช้ติดตามสถานะภายหลัง</p>

          <div className="flex flex-col gap-3">
            <Link
              href="/public/track"
              className="w-full min-h-[52px] flex items-center justify-center rounded-2xl bg-blue-600 text-white text-base font-bold active:scale-[0.98] transition-transform"
            >
              ติดตามสถานะเรื่องนี้
            </Link>
            <Link
              href="/public"
              className="w-full min-h-[52px] flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 text-base font-semibold active:scale-[0.98] transition-transform"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------- ฟอร์มแจ้งปัญหา -------
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header banner */}
      <div className="bg-gradient-to-b from-blue-700 to-blue-500 px-5 pt-6 pb-14 sm:pb-16">
        <Link href="/public" className="inline-flex items-center gap-1 text-blue-100 text-base active:opacity-70">
          ← กลับ
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-2xl shadow-lg">
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">แจ้งปัญหา</h1>
            <p className="text-blue-100 text-sm mt-0.5">ถนน ไฟฟ้า ท่อระบายน้ำ และสาธารณูปโภค</p>
          </div>
        </div>
      </div>

      {/* Form card — ยกขึ้นซ้อนกับ banner เพื่อความรู้สึกเป็นการ์ดเดียว */}
      <form onSubmit={handleSubmit} className="px-4 -mt-8 sm:-mt-10 pb-10">
        <div className="mx-auto w-full max-w-md bg-white rounded-3xl shadow-lg p-5 sm:p-6 space-y-5">

          {/* ประเภทปัญหา */}
          <div>
            <label className="block text-base font-semibold text-slate-800 mb-2">
              ประเภทปัญหา <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PROBLEM_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, problem_type: t }))}
                  className={`min-h-[48px] px-3 py-2.5 rounded-2xl text-sm sm:text-base font-semibold border transition-all active:scale-[0.97] ${
                    form.problem_type === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ฟิลด์ข้อความ */}
          {(['location', 'description', 'contact_name', 'contact_phone'] as const).map((field) => (
            <div key={field}>
              <label className="block text-base font-semibold text-slate-800 mb-2">
                {FIELD_LABELS[field]} <span className="text-red-500">*</span>
              </label>
              {field === 'description' ? (
                <textarea
                  rows={4}
                  value={form[field]}
                  placeholder={FIELD_PLACEHOLDERS[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full rounded-2xl px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none transition-colors"
                />
              ) : (
                <input
                  type={field === 'contact_phone' ? 'tel' : 'text'}
                  inputMode={field === 'contact_phone' ? 'tel' : 'text'}
                  value={form[field]}
                  placeholder={FIELD_PLACEHOLDERS[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full min-h-[52px] rounded-2xl px-4 text-base text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-colors"
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-red-600 text-sm sm:text-base bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[56px] rounded-2xl font-bold text-white text-lg mt-1 disabled:opacity-50 transition-all active:scale-[0.98] bg-blue-600 shadow-lg shadow-blue-600/25"
          >
            {loading ? '⏳ กำลังส่ง...' : '📤 ส่งเรื่อง'}
          </button>

          <p className="text-center text-xs sm:text-sm text-slate-400 pt-1">
            ข้อมูลของท่านจะถูกส่งถึงกองช่างเทศบาลตำบลโนนดินแดงโดยตรง
          </p>
        </div>
      </form>
    </div>
  );
}
