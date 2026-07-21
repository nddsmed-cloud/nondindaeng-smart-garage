// src/lib/supabase.ts — Supabase client helpers
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Browser / client-side (anon key) */
export function getBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Server-side with admin privileges (service role) */
export function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
