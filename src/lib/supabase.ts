
import { createClient } from '@supabase/supabase-js';

// These will need to be replaced with your actual Supabase URL and anon key
// after connecting your project to Supabase via the Lovable integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
