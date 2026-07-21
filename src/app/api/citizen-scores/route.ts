import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabase';

// GET ?national_id=xxx
export async function GET(req: NextRequest) {
  const nationalId = req.nextUrl.searchParams.get('national_id');
  if (!nationalId) return NextResponse.json({ error: 'national_id required' }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('citizen_scores')
    .select('points')
    .eq('national_id', nationalId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const total_points = (data ?? []).reduce((s, r) => s + (r.points ?? 0), 0);
  return NextResponse.json({ national_id: nationalId, total_points });
}

// POST — award points
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { national_id, action_type, points, reference_id } = body;
  if (!national_id || !action_type || !points) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('citizen_scores')
    .insert({ national_id, action_type, points, reference_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
