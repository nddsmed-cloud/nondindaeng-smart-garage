// src/app/saraban/page.tsx
// ระบบสารบรรณ — ทะเบียนหนังสือรับ/ส่ง กองช่าง (ใช้ Supabase)

import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { getAdminClient } from '../../lib/supabase';
import SarabanClient from './SarabanClient';

export default async function SarabanPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  if (!['ADMIN', 'MANAGER', 'OFFICER', 'OFFICER_GIS'].includes(role ?? '')) {
    redirect('/dashboard');
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('saraban')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs: any[] = data ?? [];

  const incoming = docs.filter(d => d.direction === 'IN').length;
  const outgoing = docs.filter(d => d.direction === 'OUT').length;
  const pending  = docs.filter(d => d.status === 'pending').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📬 ระบบสารบรรณ</h1>
          <p className="page-subtitle">
            หนังสือรับ <strong style={{ color: 'var(--blue)' }}>{incoming}</strong>
            &nbsp;·&nbsp;
            หนังสือส่ง <strong style={{ color: 'var(--green)' }}>{outgoing}</strong>
            &nbsp;·&nbsp;
            รอดำเนินการ <strong style={{ color: 'var(--yellow)' }}>{pending}</strong>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'หนังสือรับทั้งหมด', value: incoming,    icon: '📥', color: 'blue'   },
          { label: 'หนังสือส่งทั้งหมด', value: outgoing,    icon: '📤', color: 'green'  },
          { label: 'รอดำเนินการ',        value: pending,     icon: '⏳', color: 'yellow' },
          { label: 'รวมทั้งหมด',         value: docs.length, icon: '📋', color: 'blue'   },
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
        <div style={{
          background: 'var(--red-soft)', color: 'var(--red)',
          padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16,
        }}>
          ⚠️ ไม่สามารถโหลดข้อมูลได้: {error.message}
        </div>
      )}

      <SarabanClient initialDocs={docs} />
    </>
  );
}
