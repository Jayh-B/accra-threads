import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Browser / Client Components ──────────────────────────────────────────────
// Use this in 'use client' components. One shared instance is fine.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
