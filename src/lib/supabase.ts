import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* Without both values there is no backend: the form falls back to a mailto
   handoff. (createClient throws on missing values, and imported eagerly that
   white-screened the whole site, not just the form.) */
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

/* The client is ~100 kB and only the contact form needs it, so it is fetched
   on the first submit instead of shipping in the entry bundle. */
let client: Promise<SupabaseClient> | null = null;
export function getSupabase(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, supabaseAnonKey)
  );
  return client;
}
