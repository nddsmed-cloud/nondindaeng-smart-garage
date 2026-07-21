// src/app/dashboard/complaints/page.tsx
// หน้าจัดการเรื่องร้องเรียนจากประชาชน

import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import { getAdminClient } from '../../../lib/supabase';
import ComplaintsClient from './ComplaintsClient';

export default async function ComplaintsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  if (!['ADMIN', 'MANAGER', 'OFFICER', 'OFFICER_GIS'].includes(role ?? '')) {
    redirect('/dashboard');
  }

  const supabase = getAdminClient();
  const { data: reports, error } = await supabase
    .from('citizen_reports')
    .select('*')
    .order('created_at', { ascending: false });

  const rows = (reports ?? []) as Record<string, unknown>[];

  const pending    = rows.filter(r => r.status === 'pending').length;
  const inprogress = rows.filter(r => r.status === 'inprogress').length;
  const completed  = rows.filter(r => r.status === 'completed').length;
  const rejected   = rows.filter(r => r.status === 'rejected').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📣 เรื่องร้องเรียน / แจ้งปัญหา</h1>
          <p className="page-subtitle">
            รอดำเนินการ <strong style={{ color: 'var(--yellow)' }}>{pending}</strong> &nbsp;·&nbsp;
            กำลังดำเนินการ <strong style={{ color: 'var(--blue)' }}>{inprogress}</strong> &nbsp;·&nbsp;
            เสร็จสิ้น <strong style={{ color: 'var(--green)' }}>{completed}</strong> &nbsp;·&nbsp;
            ปฏิเสธ <strong style={{ color: 'var(--red)' }}>{rejected}</strong>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'รอดำเนินการ',    value: pending,    icon: '⏳', color: 'yellow' },
          { label: 'กำลังดำเนินการ', value: inprogress, icon: '🔧', color: 'blue'   },
          { label: 'เสร็จสิ้น',      value: completed,  icon: '✅', color: 'green'  },
          { label: 'ปฏิเสธ',         value: rejected,   icon: '❌', color: 'red'    },
          { label: 'ทั้งหมด',        value: rows.length, icon: '📋', color: 'blue'  },
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
          <div style={{ fontSize: 12, marginTop: 4 }}>กรุณาตรวจสอบว่าตาราง <code>citizen_reports</code> มีอยู่ใน Supabase</div>
        </div>
      )}

      <ComplaintsClient initialReports={rows as Parameters<typeof ComplaintsClient>[0]['initialReports']} />
    </>
  );
}
