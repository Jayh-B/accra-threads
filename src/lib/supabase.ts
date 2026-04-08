import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for use in Browser/Client Components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for Server Components/Actions (if needed, though standard supabase-js is fine)
export const createStaticClient = () => createClient(supabaseUrl, supabaseAnonKey);
