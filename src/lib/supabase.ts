import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Browser / Client Components ──────────────────────────────────────────────
// Use this in 'use client' components. One shared instance is fine.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Server Components & Route Handlers ───────────────────────────────────────
// Uses @supabase/ssr to read/write cookies so sessions persist across requests.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — set-cookie ignored at render time.
          // Middleware handles refreshing; this is a no-op safety guard.
        }
      },
    },
  });
}

// ── Middleware helper ─────────────────────────────────────────────────────────
// Used inside middleware.ts where we have direct access to Request/Response.
export { createServerClient };
