
import { createClient } from '@supabase/supabase-js';

// Use the same URL and key that are in src/integrations/supabase/client.ts
const supabaseUrl = "https://nxhcxszguceszkucmaqg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aGN4c3pndWNlc3prdWNtYXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MDY0MjYsImV4cCI6MjA2Mjk4MjQyNn0.pQdPMLOY53-ZZKdHsfCP2Z-OGUAQGO2nWiofofFVWNA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
