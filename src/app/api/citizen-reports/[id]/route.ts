// src/app/api/citizen-reports/[id]/route.ts
// PATCH — อัปเดตสถานะเรื่องร้องเรียน (สำหรับเจ้าหน้าที่)

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase';
import { auth } from '../../../../auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user.role;
  if (!['ADMIN', 'MANAGER', 'OFFICER', 'OFFICER_GIS'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { status, officer_note } = body;

  const validStatuses = ['pending', 'inprogress', 'completed', 'rejected'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (officer_note !== undefined) updateData.officer_note = officer_note;
  if (status === 'completed' || status === 'rejected') {
    updateData.resolved_by = session.user.name ?? session.user.username;
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('citizen_reports')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
