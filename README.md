# Tabi 旅 — Planificateur de voyage Japon

Application React + Vite pour planifier un voyage à deux au Japon, avec synchronisation cloud via Supabase.

## ✨ Fonctionnalités

- **Dashboard** — vue d'ensemble avec compte à rebours, budget, prochaines activités
- **Budget partagé (Splitwise)** — qui doit combien à qui, avec bandeau de balance proéminent
- **Itinéraire** — réorganise l'ordre des villes par drag & drop (flèches sur mobile)
- **Vue Par jour** — déroulé journalier avec hôtels multi-nuits, restos et activités
- **Catalogues** — villes, activités, restaurants, hébergements (tout est éditable)
- **Checklist** avant départ + valise
- **Journal** de voyage (notes datées)
- **Wishlist souvenirs**

Toutes les entrées sont **éditables au clic** et stockées en partagé via Supabase (avec cache local). Si le cloud est injoignable, l'app passe automatiquement en mode local après 3 secondes.

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en mode développement (rechargement à chaud)
npm run dev

# 3. Construire pour la production
npm run build

# 4. Prévisualiser le build localement
npm run preview
```

## ☁️ Configuration Supabase

Modifie `src/config.js` avec **tes propres** URL et clé Supabase :

```js
export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
export const SUPABASE_KEY = "sb_publishable_..."; // ou eyJ...
export const TRIP_ID = "voyage-japon";
```

Où trouver ces valeurs : Dashboard Supabase → ⚙️ Settings → API.

**Pré-requis SQL** (à exécuter une fois dans le SQL Editor de Supabase) :

```sql
create table if not exists trips (
  id text primary key,
  content jsonb,
  updated_at timestamptz default now()
);
alter table trips enable row level security;
create policy "lecture publique"  on trips for select using (true);
create policy "ecriture publique" on trips for insert with check (true);
create policy "maj publique"      on trips for update using (true);
```

## 🚢 Déploiement sur Netlify

1. `npm run build` — génère le dossier `dist/`
2. Glisser-déposer le contenu de `dist/` sur https://app.netlify.com/drop
3. (Ou connecte le repo Git pour des déploiements automatiques avec :
   - Build command : `npm run build`
   - Publish directory : `dist`)

## 📁 Structure du projet

```
tabi-japon/
├── index.html               # Page HTML d'entrée (Vite)
├── package.json             # Dépendances npm
├── vite.config.js           # Configuration de build
├── public/                  # Assets statiques (vide pour le moment)
└── src/
    ├── main.jsx             # Point d'entrée — monte React dans #root
    ├── App.jsx              # Composant racine — sidebar + routing pages
    ├── config.js            # URL/clé Supabase, ID du voyage
    ├── constants.js         # Palette, catégories, statuts, voyageurs, citations
    ├── data/
    │   └── seed.js          # Données initiales (villes, activités, etc.)
    ├── hooks/
    │   └── useStore.js      # Hook sync cloud + cache local + polling
    ├── lib/
    │   ├── helpers.js       # fmt, uid, mergeWithSeed, gestion erreurs
    │   └── supabase.js      # Client Supabase robuste
    ├── components/
    │   ├── icons.js         # Toutes les icônes SVG (style lucide)
    │   ├── ExternalLink.jsx # Lien externe stylé
    │   ├── PhotoField.jsx   # Champ photo (URL ou upload)
    │   ├── StayAssignRow.jsx # Ligne assignation hôtel multi-nuits
    │   ├── GlobalStyles.jsx # Styles globaux (polices, animations, responsive)
    │   └── ui/
    │       ├── Btn.jsx      # Bouton (5 variantes)
    │       ├── Card.jsx     # Carte blanche avec ombre
    │       └── index.jsx    # Pill, Field, Modal, Progress, Donut, Empty, SectionTitle
    └── pages/
        ├── Dashboard.jsx
        ├── Budget.jsx
        ├── Itinerary.jsx
        ├── ByDay.jsx
        ├── Cities.jsx
        ├── Activities.jsx
        ├── Restaurants.jsx
        ├── Stays.jsx
        ├── Checklist.jsx
        ├── Notes.jsx
        └── Souvenirs.jsx
```

## 🎨 Personnalisation

- **Couleurs** : modifie l'objet `T` dans `src/constants.js`
- **Voyageurs** : modifie `PEOPLE` et `PERSON_COLOR` dans `src/constants.js`
- **Données initiales** : modifie `src/data/seed.js`
- **Icônes** : ajoute de nouveaux SVG dans `src/components/icons.js`
- **Citations** : modifie `QUOTES` dans `src/constants.js`

## 💡 Astuces

- **Pour économiser l'egress Supabase** : utilise uniquement des **URL** d'images,
  jamais le téléversement (qui stocke en base64 dans la base = très lourd).
  Sur iPhone : long-press sur une image → "Copier l'adresse de l'image".

- **Sauvegarde manuelle des données** : dans la console du navigateur (F12),
  tape `copy(localStorage.getItem('tabi:data'))` pour copier tes données.

- **Restauration** : dans la console, tape
  `localStorage.setItem('tabi:data', '[ton JSON]')` puis recharge.

## 🛠️ Stack technique

- **React 18** — UI déclarative avec hooks
- **Vite 5** — build ultra-rapide
- **Supabase JS 2** — backend partagé (base PostgreSQL + Row Level Security)
- **CSS-in-JS inline** — pas de fichier CSS séparé, styles dans les composants
- **Google Fonts** — Fraunces (serif élégant) + Outfit (sans-serif moderne)

Pas de TypeScript, pas de framework CSS, pas de state manager — volontairement
minimal pour rester lisible et facile à modifier.

## 📜 Licence

Projet personnel. Fais-en ce que tu veux.
