// ============================================================
// CONFIGURATION SUPABASE
// ------------------------------------------------------------
// Où trouver ces 2 valeurs dans ton projet Supabase :
// Dashboard Supabase  ->  ⚙️ Settings  ->  "API" (ou "Data API")
//
// 1. SUPABASE_URL  =  champ "Project URL"
//      Ça ressemble TOUJOURS à :  https://xxxxxxxx.supabase.co
// 2. SUPABASE_KEY  =  une clé publique. Soit :
//      - "anon public"  (commence par  eyJ...  — ancien format JWT)
//      - ou "publishable"  (commence par  sb_publishable_...  — nouveau format)
//      Les DEUX fonctionnent. NE METS JAMAIS la clé "service_role" / "secret" ici.
//
// SQL à exécuter une fois pour créer la table :
//   create table if not exists trips (
//     id text primary key,
//     content jsonb,
//     updated_at timestamptz default now()
//   );
//   alter table trips enable row level security;
//   create policy "lecture publique"  on trips for select using (true);
//   create policy "ecriture publique" on trips for insert with check (true);
//   create policy "maj publique"      on trips for update using (true);
// ============================================================

export const SUPABASE_URL = "https://gmsizfjehzhndmzsneda.supabase.co";
export const SUPABASE_KEY = "sb_publishable_PSniI1CBQnPJT35IWW7n8Q_zJfblc2Q";
export const TRIP_ID = "voyage-japon"; // identifiant du voyage partagé
