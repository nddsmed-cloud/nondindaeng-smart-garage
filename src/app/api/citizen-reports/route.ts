import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabase';

// GET ?tracking=CR-xxx
export async function GET(req: NextRequest) {
  const tracking = req.nextUrl.searchParams.get('tracking');
  if (!tracking) return NextResponse.json({ error: 'tracking required' }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('citizen_reports')
    .select('*')
    .eq('tracking_number', tracking)
    .single();

  if (error || !data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(data);
}

// POST — submit citizen report
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { problem_type, location, description, contact_name, contact_phone } = body;

  if (!problem_type || !location || !description || !contact_name || !contact_phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Generate tracking number
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const { count } = await supabase.from('citizen_reports').select('*', { count: 'exact', head: true });
  const seq = String((count ?? 0) + 1).padStart(4, '0');
  const tracking_number = `CR-${date}-${seq}`;

  const { data, error } = await supabase
    .from('citizen_reports')
    .insert({ tracking_number, problem_type, location, description, contact_name, contact_phone, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
