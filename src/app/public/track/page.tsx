'use client';

import { useState } from 'react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:    { label: 'รอดำเนินการ', color: '#f59e0b', icon: '⏳' },
  inprogress: { label: 'กำลังดำเนินการ', color: '#3b82f6', icon: '🔧' },
  completed:  { label: 'เสร็จสิ้น', color: '#10b981', icon: '✅' },
  rejected:   { label: 'ปฏิเสธ', color: '#ef4444', icon: '❌' },
};

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true); setError(''); setReport(null);
    try {
      const res = await fetch(`/api/citizen-reports?tracking=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.id) { setError('ไม่พบเลขติดตามนี้ กรุณาตรวจสอบอีกครั้ง'); return; }
      setReport(data);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  const status = report ? (STATUS_CONFIG[report.status] ?? { label: report.status, color: '#94a3b8', icon: '❓' }) : null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #064e3b, #0f172a)' }}>
      <div className="px-4 pt-8 pb-4">
        <Link href="/public" className="text-emerald-300 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-black text-white mt-2">🔍 ติดตามสถานะ</h1>
        <p className="text-emerald-200 text-sm">กรอกเลขติดตามที่ได้รับ</p>
      </div>

      <form onSubmit={handleSearch} className="px-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="เช่น CR-20250721-0001"
            className="flex-1 rounded-xl px-4 py-3 text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          />
          <button type="submit" disabled={loading}
            className="bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl disabled:opacity-50">
            {loading ? '...' : 'ค้นหา'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mx-4 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</div>
      )}

      {report && status && (
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">เลขติดตาม</p>
            <p className="text-white font-black text-lg">{report.tracking_number}</p>
          </div>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">สถานะ</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{status.icon}</span>
              <span className="font-black text-lg" style={{ color: status.color }}>{status.label}</span>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">ประเภท</p>
              <p className="text-white font-semibold">{report.problem_type}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">สถานที่</p>
              <p className="text-white font-semibold">{report.location}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">รายละเอียด</p>
              <p className="text-white/80 text-sm">{report.description}</p>
            </div>
            {report.staff_note && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <p className="text-emerald-400 text-xs font-bold mb-1">📝 หมายเหตุจากเจ้าหน้าที่</p>
                <p className="text-white/80 text-sm">{report.staff_note}</p>
              </div>
            )}
            <p className="text-white/40 text-xs">แจ้งเมื่อ: {new Date(report.created_at).toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
