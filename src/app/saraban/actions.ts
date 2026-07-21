'use server';

import { getAdminClient } from '../../lib/supabase';
import { auth } from '../../auth';
import { revalidatePath } from 'next/cache';

// สร้างเลขที่หนังสืออัตโนมัติ: กช.รับ.0001/2568 หรือ กช.ส่ง.0001/2568
async function generateDocNumber(direction: 'IN' | 'OUT'): Promise<string> {
  const now = new Date();
  const buddhistYear = now.getFullYear() + 543;
  const prefix = direction === 'IN' ? 'กช.รับ' : 'กช.ส่ง';

  const supabase = getAdminClient();
  const { count } = await supabase
    .from('saraban')
    .select('id', { count: 'exact', head: true })
    .eq('direction', direction)
    .like('doc_number', `%/${buddhistYear}`);

  const seq = String((count ?? 0) + 1).padStart(4, '0');
  return `${prefix}.${seq}/${buddhistYear}`;
}

export async function createSarabanDoc(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const direction = formData.get('direction') as 'IN' | 'OUT';
  const docNumber = await generateDocNumber(direction);

  const supabase = getAdminClient();
  const { error } = await supabase.from('saraban').insert({
    doc_number:  docNumber,
    direction,
    doc_date:    formData.get('docDate') as string,
    subject:     formData.get('subject') as string,
    from_org:    formData.get('fromOrg') as string,
    to_org:      (formData.get('toOrg') as string) || '',
    urgency:     (formData.get('urgency') as string) || 'NORMAL',
    detail:      (formData.get('detail') as string) || '',
    assigned_to: (formData.get('assignedTo') as string) || '',
    due_date:    (formData.get('dueDate') as string) || null,
    created_by:  session.user.name ?? session.user.username ?? '',
    status:      'pending',
  });

  if (error) throw new Error(error.message);
  revalidatePath('/saraban');
}

export async function updateSarabanStatus(id: string, status: string, note?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const supabase = getAdminClient();
  const { error } = await supabase
    .from('saraban')
    .update({
      status,
      completed_note: note ?? '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/saraban');
}
