import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    applicant_name, applicant_phone, national_id,
    building_type, building_size, location, purpose,
    doc_id_card, doc_house_reg, doc_land_title, doc_blueprint,
    doc_owner_consent, doc_site_photo,
  } = body;

  if (!applicant_name || !applicant_phone || !building_type || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const { count } = await supabase.from('building_permits').select('*', { count: 'exact', head: true });
  const seq = String((count ?? 0) + 1).padStart(4, '0');
  const permit_number = `BP-${date}-${seq}`;

  const { data, error } = await supabase
    .from('building_permits')
    .insert({
      permit_number, applicant_name, applicant_phone, national_id,
      building_type, building_size, location, purpose,
      doc_id_card, doc_house_reg, doc_land_title: doc_land_title ?? null,
      doc_blueprint: doc_blueprint ?? null,
      doc_owner_consent: doc_owner_consent ?? null,
      doc_site_photo: doc_site_photo ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Award 30 goodness points (fire-and-forget)
  if (national_id) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://6-ndd-smart-garage.vercel.app';
    fetch(`${appUrl}/api/citizen-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ national_id, action_type: 'building_permit', points: 30, reference_id: permit_number }),
    }).catch((e) => console.error('Score award failed:', e));
  }

  return NextResponse.json(data, { status: 201 });
}
