// src/app/api/permits/[id]/route.ts
// PATCH — อัปเดตสถานะใบอนุญาตก่อสร้าง (สำหรับเจ้าหน้าที่)

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase';
import { auth } from '../../../../auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user.role;
  if (!['ADMIN', 'MANAGER', 'OFFICER'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { status, officer_note } = body;

  const validStatuses = ['pending', 'inprogress', 'approved', 'rejected', 'waiting_docs'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (officer_note !== undefined) updateData.officer_note = officer_note;
  if (status === 'approved' || status === 'rejected') {
    updateData.processed_by = session.user.name ?? session.user.username;
    updateData.processed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('building_permits')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('building_permits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
