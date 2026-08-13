import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* createClient throws when either value is missing, and because this module is
   imported at the top of the tree that threw error white-screened the entire
   site — not just the contact form. Degrade instead: export null and let the
   form fall back to a mailto handoff. */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
