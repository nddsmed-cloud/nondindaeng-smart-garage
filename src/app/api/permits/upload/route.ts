import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const docType = formData.get('doc_type') as string | null;
  const nationalId = formData.get('national_id') as string | null;

  if (!file || !docType) return NextResponse.json({ error: 'file and doc_type required' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const safeName = docType.replace(/[^a-z0-9_]/gi, '_');
  const nid = (nationalId ?? 'unknown').replace(/\D/g, '');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${safeName}_${nid}_${dateStr}.${ext}`;
  const path = `permits/${nid}/${filename}`;

  const supabase = getAdminClient();
  const { error } = await supabase.storage.from('permit-docs').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('permit-docs').getPublicUrl(path);
  return NextResponse.json({ path, publicUrl });
}
