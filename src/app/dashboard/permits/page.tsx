// src/app/dashboard/permits/page.tsx
// หน้าจัดการใบอนุญาตก่อสร้าง (Admin/Officer)

import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import { getAdminClient } from '../../../lib/supabase';
import PermitsClient from './PermitsClient';

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending:      { label: 'รออนุมัติ',         badge: 'badge-yellow' },
  inprogress:   { label: 'กำลังตรวจสอบ',      badge: 'badge-blue'   },
  waiting_docs: { label: 'รอเอกสารเพิ่มเติม', badge: 'badge-purple' },
  approved:     { label: 'อนุมัติแล้ว',        badge: 'badge-green'  },
  rejected:     { label: 'ไม่อนุมัติ',         badge: 'badge-red'    },
};

export default async function PermitsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  if (!['ADMIN', 'MANAGER', 'OFFICER'].includes(role ?? '')) {
    redirect('/dashboard');
  }

  const supabase = getAdminClient();
  const { data: permits, error } = await supabase
    .from('building_permits')
    .select('*')
    .order('created_at', { ascending: false });

  const rows = (permits ?? []) as Record<string, unknown>[];

  const pending = rows.filter(p => p.status === 'pending').length;
  const inprogress = rows.filter(p => p.status === 'inprogress' || p.status === 'waiting_docs').length;
  const approved = rows.filter(p => p.status === 'approved').length;
  const rejected = rows.filter(p => p.status === 'rejected').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏗️ จัดการใบอนุญาตก่อสร้าง</h1>
          <p className="page-subtitle">
            รออนุมัติ <strong style={{ color: 'var(--yellow)' }}>{pending}</strong> &nbsp;·&nbsp;
            กำลังตรวจสอบ <strong style={{ color: 'var(--blue)' }}>{inprogress}</strong> &nbsp;·&nbsp;
            อนุมัติ <strong style={{ color: 'var(--green)' }}>{approved}</strong> &nbsp;·&nbsp;
            ไม่อนุมัติ <strong style={{ color: 'var(--red)' }}>{rejected}</strong>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'รออนุมัติ', value: pending, icon: '⏳', color: 'yellow' },
          { label: 'กำลังตรวจสอบ', value: inprogress, icon: '🔍', color: 'blue' },
          { label: 'อนุมัติแล้ว', value: approved, icon: '✅', color: 'green' },
          { label: 'ไม่อนุมัติ', value: rejected, icon: '❌', color: 'red' },
          { label: 'ทั้งหมด', value: rows.length, icon: '📄', color: 'blue' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
          ⚠️ ไม่สามารถโหลดข้อมูลได้: {error.message}
          <div style={{ fontSize: 12, marginTop: 4 }}>กรุณาตรวจสอบว่าตาราง <code>building_permits</code> มีอยู่ใน Supabase</div>
        </div>
      )}

      <PermitsClient initialPermits={rows as Parameters<typeof PermitsClient>[0]['initialPermits']} />
    </>
  );
}
