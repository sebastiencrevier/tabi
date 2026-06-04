import type { AppData } from "../types";

export const fmt = (n: number | undefined | null): string =>
  new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 0 }).format(Math.round(n || 0));

export const uid = (): string => Math.random().toString(36).slice(2, 10);

export function mergeWithSeed<T>(loaded: unknown, seed: T): T {
  if (!loaded || typeof loaded !== "object" || Array.isArray(loaded)) return seed;
  const out: Record<string, unknown> = {};
  const src = loaded as Record<string, unknown>;
  const s = seed as Record<string, unknown>;
  for (const k in s) {
    const sv = s[k];
    const lv = src[k];
    if (Array.isArray(sv)) {
      out[k] = Array.isArray(lv) ? lv : sv;
    } else if (sv && typeof sv === "object") {
      out[k] =
        lv && typeof lv === "object" && !Array.isArray(lv)
          ? { ...(sv as object), ...(lv as object) }
          : sv;
    } else {
      out[k] = lv !== undefined && lv !== null ? lv : sv;
    }
  }
  for (const k in src) if (!(k in out)) out[k] = src[k];
  return out as T;
}

export function humanizeSupaError(error: unknown): string {
  const e = error as { message?: string; hint?: string; code?: string } | null;
  const msg = (e && (e.message || e.hint || "")) + "";
  const code = e && e.code;
  if (/relation .* does not exist/i.test(msg) || code === "42P01")
    return "La table « trips » n'existe pas encore dans Supabase (voir l'étape SQL dans le guide).";
  if (/row-level security|RLS|permission denied/i.test(msg) || code === "42501")
    return "Accès refusé par la sécurité (RLS). Active une policy de lecture/écriture sur la table « trips ».";
  if (/Invalid API key|JWT|apikey/i.test(msg))
    return "Clé Supabase invalide. Recopie la clé « anon/publishable » depuis Settings > API.";
  return msg || "Erreur Supabase inconnue.";
}

export function countBase64Photos(data: Partial<AppData> | null): number {
  if (!data) return 0;
  let count = 0;
  const check = (item: { photo?: string } | null) => {
    if (item && typeof item.photo === "string" && item.photo.startsWith("data:")) count++;
  };
  (data.activities || []).forEach(check);
  (data.restaurants || []).forEach(check);
  (data.stays || []).forEach(check);
  return count;
}

export function stripBase64Photos(data: AppData): AppData {
  const strip = <T extends { photo?: string }>(item: T): T =>
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
