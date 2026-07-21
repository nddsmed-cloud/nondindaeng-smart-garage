'use client';

import { useState } from 'react';

type Permit = {
  id: string;
  permit_number: string;
  applicant_name: string;
  applicant_phone: string;
  national_id: string;
  building_type: string;
  building_size: string;
  location: string;
  purpose: string;
  status: string;
  officer_note?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  doc_id_card?: string;
  doc_house_reg?: string;
  doc_land_title?: string;
  doc_blueprint?: string;
  doc_owner_consent?: string;
  doc_site_photo?: string;
};

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending:       { label: 'รออนุมัติ',       badge: 'badge-yellow' },
  inprogress:    { label: 'กำลังตรวจสอบ',    badge: 'badge-blue'   },
  waiting_docs:  { label: 'รอเอกสารเพิ่มเติม', badge: 'badge-purple' },
  approved:      { label: 'อนุมัติแล้ว',      badge: 'badge-green'  },
  rejected:      { label: 'ไม่อนุมัติ',       badge: 'badge-red'    },
};

function formatThaiDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

function DocLink({ url, label }: { url?: string; label: string }) {
  if (!url) return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer"
      style={{ color: 'var(--blue)', fontSize: 11, textDecoration: 'underline' }}>
      {label}
    </a>
  );
}

export default function PermitsClient({ initialPermits }: { initialPermits: Permit[] }) {
  const [permits, setPermits] = useState<Permit[]>(initialPermits);
  const [selected, setSelected] = useState<Permit | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? permits : permits.filter(p => p.status === filter);

  async function updateStatus(id: string, status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/permits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, officer_note: note }),
      });
      if (!res.ok) throw new Error('update failed');
      const updated = await res.json();
      setPermits(ps => ps.map(p => p.id === id ? { ...p, ...updated } : p));
      setSelected(prev => prev?.id === id ? { ...prev, ...updated } : prev);
    } catch (e) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  function openDetail(p: Permit) {
    setSelected(p);
    setNote(p.officer_note ?? '');
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* List Panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'pending', label: 'รออนุมัติ' },
            { key: 'inprogress', label: 'กำลังตรวจสอบ' },
            { key: 'waiting_docs', label: 'รอเอกสาร' },
            { key: 'approved', label: 'อนุมัติแล้ว' },
            { key: 'rejected', label: 'ไม่อนุมัติ' },
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
                <th>เลขคำขอ</th>
                <th>ผู้ขอ</th>
                <th>ประเภทอาคาร</th>
                <th>สถานที่</th>
                <th>วันที่ยื่น</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">ไม่มีข้อมูล</td></tr>
              ) : filtered.map(p => {
                const cfg = STATUS_CONFIG[p.status] ?? { label: p.status, badge: 'badge-blue' };
                return (
                  <tr key={p.id} style={{ cursor: 'pointer', background: selected?.id === p.id ? 'var(--blue-soft)' : '' }}
                    onClick={() => openDetail(p)}>
                    <td>
                      <div className="td-primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {p.permit_number}
                      </div>
                    </td>
                    <td>
                      <div className="td-primary">{p.applicant_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.applicant_phone}</div>
                    </td>
                    <td>{p.building_type}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.location}
                    </td>
                    <td style={{ fontSize: 12 }}>{formatThaiDate(p.created_at)}</td>
                    <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openDetail(p); }}>
                        รายละเอียด
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
          width: 360,
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
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>รายละเอียดคำขอ</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            {(() => {
              const cfg = STATUS_CONFIG[selected.status] ?? { label: selected.status, badge: 'badge-blue' };
              return <span className={`badge ${cfg.badge}`} style={{ fontSize: 13 }}>{cfg.label}</span>;
            })()}
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginTop: 6 }}>
              {selected.permit_number}
            </div>
          </div>

          {/* Info Rows */}
          {[
            ['ผู้ขออนุญาต', selected.applicant_name],
            ['เบอร์โทร', selected.applicant_phone],
            ['เลขบัตร ปชช.', selected.national_id],
            ['ประเภทอาคาร', selected.building_type],
            ['ขนาด', selected.building_size],
            ['สถานที่', selected.location],
            ['วัตถุประสงค์', selected.purpose],
            ['วันที่ยื่น', formatThaiDate(selected.created_at)],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{val}</span>
            </div>
          ))}

          {/* เอกสารแนบ */}
          <div style={{ marginTop: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>📎 เอกสารแนบ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <DocLink url={selected.doc_id_card} label="สำเนาบัตรประชาชน" />
              <DocLink url={selected.doc_house_reg} label="สำเนาทะเบียนบ้าน" />
              <DocLink url={selected.doc_land_title} label="สำเนาโฉนดที่ดิน" />
              <DocLink url={selected.doc_blueprint} label="แบบแปลนก่อสร้าง" />
              <DocLink url={selected.doc_owner_consent} label="หนังสือยินยอม" />
              <DocLink url={selected.doc_site_photo} label="รูปถ่ายสถานที่" />
            </div>
          </div>

          {/* หมายเหตุเจ้าหน้าที่ */}
          {selected.status !== 'approved' && selected.status !== 'rejected' && (
            <>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  หมายเหตุ / เหตุผล
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ระบุเหตุผลหรือหมายเหตุ..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: 12,
                    resize: 'vertical',
                    background: 'var(--bg-base)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {selected.status === 'pending' && (
                  <button className="btn btn-sm btn-primary"
                    disabled={loading}
                    onClick={() => updateStatus(selected.id, 'inprogress')}>
                    🔍 เริ่มตรวจสอบ
                  </button>
                )}
                {(selected.status === 'pending' || selected.status === 'inprogress') && (
                  <button className="btn btn-sm"
                    disabled={loading}
                    style={{ background: 'var(--purple-soft)', color: 'var(--purple)', border: 'none' }}
                    onClick={() => updateStatus(selected.id, 'waiting_docs')}>
                    📋 รอเอกสาร
                  </button>
                )}
                <button className="btn btn-sm"
                  disabled={loading}
                  style={{ background: 'var(--green-soft)', color: 'var(--green)', border: 'none' }}
                  onClick={() => updateStatus(selected.id, 'approved')}>
                  ✅ อนุมัติ
                </button>
                <button className="btn btn-sm"
                  disabled={loading}
                  style={{ background: 'var(--red-soft)', color: 'var(--red)', border: 'none' }}
                  onClick={() => updateStatus(selected.id, 'rejected')}>
                  ❌ ไม่อนุมัติ
                </button>
              </div>
            </>
          )}

          {(selected.status === 'approved' || selected.status === 'rejected') && (
            <div style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: selected.status === 'approved' ? 'var(--green-soft)' : 'var(--red-soft)',
              fontSize: 12,
            }}>
              <strong>{selected.status === 'approved' ? '✅ อนุมัติโดย' : '❌ ปฏิเสธโดย'}:</strong>{' '}
              {selected.processed_by ?? '—'}
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
