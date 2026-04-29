import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Browser / Client Components ──────────────────────────────────────────────
// Use this in 'use client' components. One shared instance is fine.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let cachedBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local, then restart the dev server.'
    );
  }
  if (typeof window === 'undefined') {
    throw new Error('Supabase browser client was requested on the server.');
  }
  if (!cachedBrowserClient) {
    cachedBrowserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return cachedBrowserClient;
}
