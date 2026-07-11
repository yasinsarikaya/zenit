import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_CONFIGURED = !!(url && anonKey);
if (!SUPABASE_CONFIGURED) { console.warn("Offline-Modus aktiv."); }
export const supabase = SUPABASE_CONFIGURED ? createClient(url, anonKey) : null;
