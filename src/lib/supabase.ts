import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Returns true only if env vars are present — safe to call at any time */
export const isSupabaseConfigured = () =>
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;
