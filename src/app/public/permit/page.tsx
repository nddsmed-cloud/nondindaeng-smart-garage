'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function formatNationalId(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 13);
  if (d.length <= 1) return d;
  if (d.length <= 5) return `${d[0]}-${d.slice(1)}`;
  if (d.length <= 10) return `${d[0]}-${d.slice(1, 5)}-${d.slice(5)}`;
  if (d.length <= 12) return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10)}`;
  return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d.slice(12)}`;
}

function validateNationalId(id: string) {
  const d = id.replace(/\D/g, '');
  if (d.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(d[i]) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(d[12]);
}

const REQUIRED_DOCS = [
  { key: 'doc_id_card', label: 'สำเนาบัตรประชาชน', icon: '🪪' },
  { key: 'doc_house_reg', label: 'สำเนาทะเบียนบ้าน', icon: '🏠' },
  { key: 'doc_land_title', label: 'สำเนาโฉนดที่ดิน', icon: '📜' },
  { key: 'doc_blueprint', label: 'แบบแปลนก่อสร้าง', icon: '📐' },
];
const OPTIONAL_DOCS = [
  { key: 'doc_owner_consent', label: 'หนังสือยินยอมเจ้าของที่', icon: '📝' },
  { key: 'doc_site_photo', label: 'รูปถ่ายสถานที่', icon: '📸' },
];

type DocUrls = Record<string, string>;

function DocSlotCard({ docKey, label, icon, value, onUpload }: {
  docKey: string; label: string; icon: string;
  value: string; onUpload: (key: string, url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('doc_type', docKey);
      fd.append('national_id', '0000000000000');
      const res = await fetch('/api/permits/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.publicUrl) onUpload(docKey, data.publicUrl);
    } catch { /* ignore */ } finally {
      setUploading(false);
    }
  }

  const done = !!value;
  return (
    <button type="button" onClick={() => inputRef.current?.click()}
      className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-95"
      style={{ background: done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${done ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}` }}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight truncate">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: done ? '#6ee7b7' : 'rgba(255,255,255,0.4)' }}>
          {uploading ? '⏳ กำลังอัปโหลด...' : done ? '✅ อัปโหลดแล้ว' : 'กดเพื่ออัปโหลด'}
        </p>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFile} />
    </button>
  );
}

export default function PermitPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ applicant_name: '', applicant_phone: '', national_id: '', building_type: '', building_size: '', location: '', purpose: '' });
  const [docUrls, setDocUrls] = useState<DocUrls>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ permit_number: string; total_points: number } | null>(null);
  const [points, setPoints] = useState(0);

  function setDoc(key: string, url: string) {
    setDocUrls(d => ({ ...d, [key]: url }));
  }

  function validateStep1() {
    if (!form.applicant_name || !form.applicant_phone || !form.national_id) return 'กรุณากรอกข้อมูลให้ครบ';
    if (!validateNationalId(form.national_id)) return 'เลขบัตรประชาชนไม่ถูกต้อง';
    return '';
  }

  function validateStep2() {
    if (!form.building_type || !form.building_size || !form.location || !form.purpose) return 'กรุณากรอกข้อมูลให้ครบ';
    return '';
  }

  function validateStep3() {
    const missing = REQUIRED_DOCS.filter(d => !docUrls[d.key]).map(d => d.label);
    if (missing.length > 0) return `เอกสารที่ยังขาด: ${missing.join(', ')}`;
    return '';
  }

  function nextStep() {
    setError('');
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : step === 3 ? validateStep3() : '';
    if (err) { setError(err); return; }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setLoading(true); setError('');
    try {
      const nationalIdClean = form.national_id.replace(/\D/g, '');
      const res = await fetch('/api/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, national_id: nationalIdClean, ...docUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      setResult({ permit_number: data.permit_number, total_points: 0 });
      // count-up animation
      let c = 0;
      const iv = setInterval(() => { c += 1; setPoints(c); if (c >= 30) clearInterval(iv); }, 40);
      // fetch total points
      try {
        const sr = await fetch(`/api/citizen-scores?national_id=${nationalIdClean}`);
        const sd = await sr.json();
        if (sd.total_points) setResult(r => r ? { ...r, total_points: sd.total_points } : r);
      } catch { /* ignore */ }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const STEPS = ['ข้อมูลผู้ขอ', 'ข้อมูลก่อสร้าง', 'เอกสารแนบ', 'ยืนยัน'];

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom, #78350f, #0f172a)' }}>
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-black text-white mb-1">ยื่นคำขอสำเร็จ!</h2>
          <p className="text-amber-300 font-black text-4xl mb-2">+{points} คะแนน</p>
          <p className="text-white/60 text-sm mb-4">คะแนนความดีสะสม</p>
          <div className="rounded-2xl px-6 py-4 mb-6" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p className="text-white/50 text-xs mb-1">เลขคำขอ</p>
            <p className="text-3xl font-black text-amber-400 tracking-widest">{result.permit_number}</p>
          </div>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link href="/public/track" className="block bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-center">ติดตามสถานะ</Link>
            <Link href="/public" className="block text-white/60 text-sm text-center">กลับหน้าหลัก</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #78350f, #0f172a)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <Link href="/public" className="text-amber-300 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-black text-white mt-2">🏗️ ขออนุญาตก่อสร้าง</h1>
        <p className="text-amber-200 text-sm">แบบ ข.1 — ยื่นออนไลน์</p>
      </div>

      {/* Step bar */}
      <div className="flex items-center px-4 mb-6">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  style={{ background: done ? '#10b981' : active ? '#f59e0b' : 'rgba(255,255,255,0.15)', color: 'white' }}>
                  {done ? '✓' : n}
                </div>
                <span className="text-[9px] mt-1 font-semibold whitespace-nowrap"
                  style={{ color: active ? '#fbbf24' : done ? '#6ee7b7' : 'rgba(255,255,255,0.4)' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded" style={{ background: done ? '#10b981' : 'rgba(255,255,255,0.15)' }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-10">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            {[
              { key: 'applicant_name', label: 'ชื่อ-นามสกุล *', type: 'text' },
              { key: 'applicant_phone', label: 'เบอร์โทรศัพท์ *', type: 'tel' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-white/80 text-sm font-semibold block mb-1.5">{label}</label>
                <input type={type} value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
            ))}
            <div>
              <label className="text-white/80 text-sm font-semibold block mb-1.5">เลขบัตรประชาชน *</label>
              <input type="text" value={form.national_id} maxLength={17}
                onChange={e => setForm(f => ({ ...f, national_id: formatNationalId(e.target.value) }))}
                placeholder="X-XXXX-XXXXX-XX-X"
                className="w-full rounded-xl px-4 py-3 text-white text-sm tracking-widest"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            {[
              { key: 'building_type', label: 'ประเภทอาคาร *', placeholder: 'เช่น บ้านพักอาศัย, อาคารพาณิชย์' },
              { key: 'building_size', label: 'ขนาดอาคาร (ตร.ม.) *', placeholder: 'เช่น 120 ตร.ม.' },
              { key: 'location', label: 'ที่ตั้งก่อสร้าง *', placeholder: 'บ้านเลขที่ / หมู่บ้าน / ตำบล' },
              { key: 'purpose', label: 'วัตถุประสงค์การก่อสร้าง *', placeholder: 'เช่น ใช้อยู่อาศัย' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-white/80 text-sm font-semibold block mb-1.5">{label}</label>
                <input type="text" value={form[key as keyof typeof form]} placeholder={placeholder}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
            ))}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-white/60 text-xs mb-2">เอกสารบังคับ (4 รายการ)</p>
            {REQUIRED_DOCS.map(d => (
              <DocSlotCard key={d.key} docKey={d.key} label={d.label} icon={d.icon} value={docUrls[d.key] ?? ''} onUpload={setDoc} />
            ))}
            <p className="text-white/60 text-xs mt-4 mb-2">เอกสารเพิ่มเติม (ถ้ามี)</p>
            {OPTIONAL_DOCS.map(d => (
              <DocSlotCard key={d.key} docKey={d.key} label={d.label} icon={d.icon} value={docUrls[d.key] ?? ''} onUpload={setDoc} />
            ))}
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {[
                ['ชื่อผู้ขอ', form.applicant_name],
                ['เบอร์โทร', form.applicant_phone],
                ['เลขบัตร', form.national_id],
                ['ประเภทอาคาร', form.building_type],
                ['ขนาด', form.building_size],
                ['สถานที่', form.location],
                ['วัตถุประสงค์', form.purpose],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <span className="text-white/50 text-sm">{label}</span>
                  <span className="text-white font-semibold text-sm text-right max-w-[60%]">{val}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <p className="text-amber-300 text-sm font-semibold">📎 เอกสารที่แนบ: {Object.keys(docUrls).length} ไฟล์</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-emerald-400 text-sm">🏆 คุณจะได้รับ <span className="font-black text-lg">+30 คะแนน</span> เมื่อยื่นคำขอสำเร็จ</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
              className="flex-1 py-3 rounded-xl font-bold text-white/70 border border-white/20">
              ← ย้อนกลับ
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="flex-1 py-3 rounded-xl font-black text-white"
              style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}>
              ถัดไป →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3 rounded-xl font-black text-white disabled:opacity-50"
              style={{ background: loading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(to right, #f59e0b, #d97706)' }}>
              {loading ? '⏳ กำลังส่ง...' : '✅ ยื่นคำขอ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
