// ============================================================
// HELPERS — utilitaires partagés dans toute l'app
// ============================================================

/** Formatte un nombre comme un montant : 1234.56 → "1 235" */
export const fmt = (n) =>
  new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 }).format(Math.round(n || 0));

/** Génère un identifiant court unique */
export const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Fusion de sécurité : garantit que les données chargées contiennent TOUJOURS
 * toutes les clés attendues. Empêche tout plantage si le cache local ou le
 * cloud renvoie des données partielles ou issues d'une ancienne version.
 */
export function mergeWithSeed(loaded, seed) {
  if (!loaded || typeof loaded !== "object" || Array.isArray(loaded)) return seed;
  const out = {};
  for (const k in seed) {
    const sv = seed[k];
    const lv = loaded[k];
    if (Array.isArray(sv)) {
      out[k] = Array.isArray(lv) ? lv : sv;
    } else if (sv && typeof sv === "object") {
      out[k] =
        lv && typeof lv === "object" && !Array.isArray(lv) ? { ...sv, ...lv } : sv;
    } else {
      out[k] = lv !== undefined && lv !== null ? lv : sv;
    }
  }
  for (const k in loaded) if (!(k in out)) out[k] = loaded[k];
  return out;
}

/** Traduit une erreur Supabase en message clair pour l'utilisateur. */
export function humanizeSupaError(error) {
  const msg = (error && (error.message || error.hint || "")) + "";
  const code = error && error.code;
  if (/relation .* does not exist/i.test(msg) || code === "42P01")
    return "La table « trips » n'existe pas encore dans Supabase (voir l'étape SQL dans le guide).";
  if (/row-level security|RLS|permission denied/i.test(msg) || code === "42501")
    return "Accès refusé par la sécurité (RLS). Active une policy de lecture/écriture sur la table « trips ».";
  if (/Invalid API key|JWT|apikey/i.test(msg))
    return "Clé Supabase invalide. Recopie la clé « anon/publishable » depuis Settings > API.";
  return msg || "Erreur Supabase inconnue.";
}

/** Compte les photos en base64 (lourdes) présentes dans les données. */
export function countBase64Photos(data) {
  if (!data) return 0;
  let count = 0;
  const check = (item) => {
    if (item && typeof item.photo === "string" && item.photo.startsWith("data:")) count++;
  };
  (data.activities || []).forEach(check);
  (data.restaurants || []).forEach(check);
  (data.stays || []).forEach(check);
  return count;
}

/** Retire les photos base64 pour alléger les données. */
export function stripBase64Photos(data) {
  const strip = (item) =>
    item && typeof item.photo === "string" && item.photo.startsWith("data:")
      ? { ...item, photo: "" }
      : item;
  return {
    ...data,
    activities: (data.activities || []).map(strip),
    restaurants: (data.restaurants || []).map(strip),
    stays: (data.stays || []).map(strip),
  };
}
