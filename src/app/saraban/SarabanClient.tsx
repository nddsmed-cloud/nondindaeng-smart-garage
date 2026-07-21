'use client';

import { useState, useTransition } from 'react';
import { createSarabanDoc } from './actions';

// Supabase คืนค่า snake_case
type Doc = {
  id: string;
  doc_number: string;
  doc_date: string;
  direction: 'IN' | 'OUT';
  subject: string;
  from_org: string;
  to_org: string;
  urgency: string;
  status: string;
  assigned_to: string;
  due_date?: string | null;
  created_by: string;
  detail: string;
  completed_note: string;
  created_at: string;
  updated_at: string;
};

const URGENCY_LABELS: Record<string, { label: string; badge: string }> = {
  NORMAL:      { label: 'ปกติ',    badge: 'badge-blue'   },
  URGENT:      { label: 'ด่วน',    badge: 'badge-yellow' },
  VERY_URGENT: { label: 'ด่วนมาก', badge: 'badge-red'    },
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'รอดำเนินการ',    badge: 'badge-yellow' },
  inprogress: { label: 'กำลังดำเนินการ', badge: 'badge-blue'   },
  completed:  { label: 'เสร็จสิ้น',      badge: 'badge-green'  },
};

function formatThaiDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

function InputField({ label, name, required, placeholder, type = 'text' }: {
  label: string; name: string; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}{required ? ' *' : ''}</label>
      <input type={type} name={name} required={required} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-base)' }} />
    </div>
  );
}

export default function SarabanClient({ initialDocs }: { initialDocs: Doc[] }) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [filter, setFilter] = useState<'all' | 'IN' | 'OUT'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState('');

  const filtered = docs
    .filter(d => filter === 'all' || d.direction === filter)
    .filter(d => statusFilter === 'all' || d.status === statusFilter);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createSarabanDoc(fd);
        setShowForm(false);
        window.location.reload();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      }
    });
  }

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Direction */}
        {(['all', 'IN', 'OUT'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
            {f === 'all' ? 'ทั้งหมด' : f === 'IN' ? '📥 หนังสือรับ' : '📤 หนังสือส่ง'}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        {/* Status */}
        {[
          { k: 'all', l: 'ทุกสถานะ' },
          { k: 'pending', l: 'รอดำเนินการ' },
          { k: 'inprogress', l: 'กำลังดำเนินการ' },
          { k: 'completed', l: 'เสร็จสิ้น' },
        ].map(({ k, l }) => (
          <button key={k} onClick={() => setStatusFilter(k)}
            className={`btn btn-sm ${statusFilter === k ? 'btn-primary' : 'btn-ghost'}`}>
            {l}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(v => !v); setFormError(''); }}>
          {showForm ? '✕ ยกเลิก' : '+ บันทึกหนังสือ'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📝 บันทึกหนังสือใหม่</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Direction */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>ประเภท *</label>
                <select name="direction" required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-base)' }}>
                  <option value="IN">📥 หนังสือรับ</option>
                  <option value="OUT">📤 หนังสือส่ง</option>
                </select>
              </div>
              {/* Urgency */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>ความเร่งด่วน</label>
                <select name="urgency"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-base)' }}>
                  <option value="NORMAL">ปกติ</option>
                  <option value="URGENT">ด่วน</option>
                  <option value="VERY_URGENT">ด่วนมาก</option>
                </select>
              </div>
              <InputField label="วันที่หนังสือ" name="docDate" required placeholder="เช่น 21 กรกฎาคม 2568" />
              <InputField label="กำหนดแล้วเสร็จ" name="dueDate" placeholder="เช่น 31 กรกฎาคม 2568" />
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField label="เรื่อง" name="subject" required placeholder="ชื่อเรื่องหนังสือ" />
              </div>
              <InputField label="จาก (ต้นทาง)" name="fromOrg" required placeholder="หน่วยงานต้นทาง" />
              <InputField label="ถึง (ปลายทาง)" name="toOrg" placeholder="หน่วยงานปลายทาง" />
              <InputField label="มอบหมายให้" name="assignedTo" placeholder="ชื่อผู้รับผิดชอบ" />
              <InputField label="รายละเอียดเพิ่มเติม" name="detail" placeholder="หมายเหตุ" />
            </div>
            {formError && (
              <p style={{ marginTop: 10, color: 'var(--red)', fontSize: 12, background: 'var(--red-soft)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                ⚠️ {formError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {/* Table + Detail */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>เลขที่หนังสือ</th>
                  <th>ประเภท</th>
                  <th>เรื่อง</th>
                  <th>จาก / ถึง</th>
                  <th>ความเร่งด่วน</th>
                  <th>สถานะ</th>
                  <th>วันที่บันทึก</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="table-empty">ยังไม่มีข้อมูล</td></tr>
                ) : filtered.map(d => {
                  const urgCfg = URGENCY_LABELS[d.urgency]  ?? { label: d.urgency,  badge: 'badge-blue' };
                  const stCfg  = STATUS_LABELS[d.status]    ?? { label: d.status,   badge: 'badge-blue' };
                  return (
                    <tr key={d.id}
                      style={{ cursor: 'pointer', background: selected?.id === d.id ? 'var(--blue-soft)' : '' }}
                      onClick={() => setSelected(d)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{d.doc_number}</td>
                      <td style={{ fontSize: 13 }}>{d.direction === 'IN' ? '📥 รับ' : '📤 ส่ง'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.subject}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {d.direction === 'IN' ? `จาก: ${d.from_org}` : `ถึง: ${d.to_org || d.from_org}`}
                      </td>
                      <td><span className={`badge ${urgCfg.badge}`} style={{ fontSize: 10 }}>{urgCfg.label}</span></td>
                      <td><span className={`badge ${stCfg.badge}`}  style={{ fontSize: 10 }}>{stCfg.label}</span></td>
                      <td style={{ fontSize: 12 }}>{formatThaiDate(d.created_at)}</td>
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
            width: 320, flexShrink: 0,
            background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
            padding: 20, height: 'fit-content', position: 'sticky', top: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>รายละเอียด</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--blue)', marginBottom: 12 }}>
              {selected.doc_number}
            </div>

            <div style={{ marginBottom: 10 }}>
              <span className={`badge ${STATUS_LABELS[selected.status]?.badge ?? 'badge-blue'}`}>
                {STATUS_LABELS[selected.status]?.label ?? selected.status}
              </span>
              {' '}
              <span className={`badge ${URGENCY_LABELS[selected.urgency]?.badge ?? 'badge-blue'}`}>
                {URGENCY_LABELS[selected.urgency]?.label ?? selected.urgency}
              </span>
            </div>

            {[
              ['ประเภท',         selected.direction === 'IN' ? '📥 หนังสือรับ' : '📤 หนังสือส่ง'],
              ['เรื่อง',         selected.subject],
              ['วันที่หนังสือ',  selected.doc_date],
              ['จากหน่วยงาน',   selected.from_org],
              ['ถึงหน่วยงาน',   selected.to_org || '—'],
              ['มอบหมาย',       selected.assigned_to || '—'],
              ['กำหนดแล้วเสร็จ', selected.due_date || '—'],
              ['บันทึกโดย',     selected.created_by || '—'],
              ['รายละเอียด',    selected.detail || '—'],
              ['บันทึกเมื่อ',   formatThaiDate(selected.created_at)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{val}</span>
              </div>
            ))}

            {selected.completed_note && (
              <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--green-soft)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                📝 {selected.completed_note}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
