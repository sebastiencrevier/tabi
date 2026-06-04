import { createClient, SupabaseClient } from "@supabase/supabase-js";

function looksLikeValidConfig(url: string | undefined, key: string | undefined): boolean {
  if (typeof url !== "string" || typeof key !== "string") return false;
  if (!url || !key) return false;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url.trim())) return false;
  if (!(key.startsWith("eyJ") || key.startsWith("sb_publishable_") || key.startsWith("sb_")))
    return false;
  return true;
}

export const SUPA_CONFIG_OK = looksLikeValidConfig(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

let _supa: SupabaseClient | null = null;
try {
  if (SUPA_CONFIG_OK) {
    _supa = createClient(
      (import.meta.env.VITE_SUPABASE_URL as string).trim(),
      (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string).trim()
    );
  }
} catch (e) {
  console.error("Init Supabase impossible :", e);
  _supa = null;
}

export const supa: SupabaseClient | null = _supa;
