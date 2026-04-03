import { createClient } from "@supabase/supabase-js";

// Vite only exposes env vars prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[Supabase] Missing URL or anon key. Check your .env.local (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export default supabase;
