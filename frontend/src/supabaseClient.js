import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment variables."
  );
}

// Fallback values prevent the client initializer from throwing errors on dev startup
const activeUrl = supabaseUrl || "https://placeholder-project.supabase.co";
const activeKey = supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient(activeUrl, activeKey);
