// ============================================================
// CLIENT SUPABASE — initialisation robuste
// Si la config est mauvaise ou si la librairie n'est pas chargée, `supa` reste
// `null` et l'app continue de fonctionner en mode local (localStorage).
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY } from "../config.js";

function looksLikeValidConfig(url, key) {
  if (typeof url !== "string" || typeof key !== "string") return false;
  if (!url || !key) return false;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url.trim())) return false;
  if (!(key.startsWith("eyJ") || key.startsWith("sb_publishable_") || key.startsWith("sb_")))
    return false;
  return true;
}

export const SUPA_CONFIG_OK = looksLikeValidConfig(SUPABASE_URL, SUPABASE_KEY);

let _supa = null;
try {
  if (SUPA_CONFIG_OK) {
    _supa = createClient(SUPABASE_URL.trim(), SUPABASE_KEY.trim());
  }
} catch (e) {
  console.error("Init Supabase impossible :", e);
  _supa = null;
}

export const supa = _supa;
