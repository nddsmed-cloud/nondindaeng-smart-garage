'use client';

import { useState } from 'react';

type Report = {
  id: string;
  tracking_number: string;
  problem_type: string;
  location: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  status: string;
  officer_note?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  pending:    { label: 'รอดำเนินการ',    badge: 'badge-yellow', icon: '⏳' },
  inprogress: { label: 'กำลังดำเนินการ', badge: 'badge-blue',   icon: '🔧' },
  completed:  { label: 'เสร็จสิ้น',      badge: 'badge-green',  icon: '✅' },
  rejected:   { label: 'ปฏิเสธ',         badge: 'badge-red',    icon: '❌' },
};

const PROBLEM_ICONS: Record<string, string> = {
  'ถนน/ทางเดิน':      '🛣️',
  'ไฟฟ้าสาธารณะ':    '💡',
  'ท่อระบายน้ำ':      '🚰',
  'ต้นไม้/สิ่งกีดขวาง': '🌳',
  'อื่นๆ':            '📌',
};

function formatThaiDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

export default function ComplaintsClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selected, setSelected] = useState<Report | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  async function updateStatus(id: string, status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/citizen-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, officer_note: note }),
      });
      if (!res.ok) throw new Error('update failed');
      const updated = await res.json();
      setReports(rs => rs.map(r => r.id === id ? { ...r, ...updated } : r));
      setSelected(prev => prev?.id === id ? { ...prev, ...updated } : prev);
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  function openDetail(r: Report) {
    setSelected(r);
    setNote(r.officer_note ?? '');
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* List Panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'pending', label: 'รอดำเนินการ' },
            { key: 'inprogress', label: 'กำลังดำเนินการ' },
            { key: 'completed', label: 'เสร็จสิ้น' },
            { key: 'rejected', label: 'ปฏิเสธ' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>เลขติดตาม</th>
                <th>ประเภทปัญหา</th>
                <th>สถานที่</th>
                <th>ผู้แจ้ง</th>
                <th>วันที่แจ้ง</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">ไม่มีข้อมูล</td></tr>
              ) : filtered.map(r => {
                const cfg = STATUS_CONFIG[r.status] ?? { label: r.status, badge: 'badge-blue', icon: '❓' };
                const pIcon = PROBLEM_ICONS[r.problem_type] ?? '📌';
                return (
                  <tr key={r.id} style={{ cursor: 'pointer', background: selected?.id === r.id ? 'var(--blue-soft)' : '' }}
                    onClick={() => openDetail(r)}>
                    <td>
                      <div className="td-primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {r.tracking_number}
                      </div>
                    </td>
                    <td>
                      <span style={{ marginRight: 4 }}>{pIcon}</span>
                      {r.problem_type}
                    </td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.location}
                    </td>
                    <td>
                      <div className="td-primary">{r.contact_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.contact_phone}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{formatThaiDate(r.created_at)}</td>
                    <td><span className={`badge ${cfg.badge}`}>{cfg.icon} {cfg.label}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openDetail(r); }}>
                        จัดการ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{
          width: 340,
          flexShrink: 0,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: 20,
          height: 'fit-content',
          position: 'sticky',
          top: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>รายละเอียด</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 12 }}>
            {(() => {
              const cfg = STATUS_CONFIG[selected.status] ?? { label: selected.status, badge: 'badge-blue', icon: '' };
              return <span className={`badge ${cfg.badge}`} style={{ fontSize: 13 }}>{cfg.icon} {cfg.label}</span>;
            })()}
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginTop: 6 }}>
              {selected.tracking_number}
            </div>
          </div>

          {/* Problem type highlight */}
          <div style={{
            background: 'var(--blue-soft)', borderRadius: 'var(--radius-sm)',
            padding: '8px 12px', marginBottom: 12, fontSize: 13, fontWeight: 600,
          }}>
            {PROBLEM_ICONS[selected.problem_type] ?? '📌'} {selected.problem_type}
          </div>

          {[
            ['สถานที่เกิดเหตุ', selected.location],
            ['รายละเอียด', selected.description],
            ['ผู้แจ้ง', selected.contact_name],
            ['เบอร์โทร', selected.contact_phone],
            ['วันที่แจ้ง', formatThaiDate(selected.created_at)],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
            </div>
          ))}

          {/* Actions */}
          {selected.status !== 'completed' && selected.status !== 'rejected' && (
            <>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  หมายเหตุ / ผลการดำเนินงาน
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ระบุวิธีการแก้ไข หรือเหตุผล..."
                  style={{
                    width: '100%', padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    fontSize: 12, resize: 'vertical', background: 'var(--bg-base)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {selected.status === 'pending' && (
                  <button className="btn btn-sm btn-primary" disabled={loading}
                    onClick={() => updateStatus(selected.id, 'inprogress')}>
                    🔧 รับเรื่อง
                  </button>
                )}
                <button className="btn btn-sm" disabled={loading}
                  style={{ background: 'var(--green-soft)', color: 'var(--green)', border: 'none' }}
                  onClick={() => updateStatus(selected.id, 'completed')}>
                  ✅ ดำเนินการแล้ว
                </button>
                <button className="btn btn-sm" disabled={loading}
                  style={{ background: 'var(--red-soft)', color: 'var(--red)', border: 'none' }}
                  onClick={() => updateStatus(selected.id, 'rejected')}>
                  ❌ ปฏิเสธ
                </button>
              </div>
            </>
          )}

          {(selected.status === 'completed' || selected.status === 'rejected') && (
            <div style={{
              marginTop: 14, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              background: selected.status === 'completed' ? 'var(--green-soft)' : 'var(--red-soft)',
              fontSize: 12,
            }}>
              <strong>
                {selected.status === 'completed' ? '✅ ดำเนินการโดย' : '❌ ปฏิเสธโดย'}:
              </strong>{' '}{selected.resolved_by ?? '—'}
              {selected.officer_note && (
                <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                  หมายเหตุ: {selected.officer_note}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
