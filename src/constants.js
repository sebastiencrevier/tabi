// ============================================================
// CONSTANTES — palette, catégories, statuts, voyageurs
// ============================================================

import { Camera, Circle, CircleDot, CircleCheck, Home, ShoppingBag, Train, UtensilsCrossed } from "./components/icons.js";

// --- Palette de couleurs (design système minimaliste japonais) ---
export const T = {
  paper:      "#FAF8F5", // washi — fond principal
  paper2:     "#F2EEE8", // fond secondaire
  card:       "#FFFFFF",
  ink:        "#1C1A17", // sumi — texte principal
  ink2:       "#56514A", // texte secondaire
  ink3:       "#9A9389", // texte tertiaire
  line:       "#E8E2D9", // bordures
  vermilion:  "#C8443B", // 赤 torii — accent principal
  vermSoft:   "#F5E3E0",
  matcha:     "#6E7F5C", // vert — succès / nature
  matchaSoft: "#E8EDE2",
  gold:       "#B8893E", // or — premium / favoris
  goldSoft:   "#F4ECDD",
  indigo:     "#3F5169", // 藍 — info / réservé
  indigoSoft: "#E3E8EE",

  shadowSm: "0 1px 2px rgba(28,26,23,0.04), 0 1px 3px rgba(28,26,23,0.03)",
  shadowMd: "0 2px 8px rgba(28,26,23,0.05), 0 6px 20px rgba(28,26,23,0.05)",
  shadowLg: "0 8px 30px rgba(28,26,23,0.08), 0 20px 50px rgba(28,26,23,0.06)",
};

// --- Catégories de dépenses ---
export const CATS = {
  "Transport":   { color: T.indigo,    soft: T.indigoSoft, icon: Train },
  "Hébergement": { color: T.matcha,    soft: T.matchaSoft, icon: Home },
  "Restaurants": { color: T.vermilion, soft: T.vermSoft,   icon: UtensilsCrossed },
  "Activités":   { color: T.gold,      soft: T.goldSoft,   icon: Camera },
  "Shopping":    { color: "#8A6FA0",   soft: "#EFE8F2",    icon: ShoppingBag },
  "Autres":      { color: T.ink3,      soft: T.paper2,     icon: Circle },
};

// --- Statuts (activités, hébergements) ---
export const STATUS = {
  todo:     { label: "À faire",  color: T.ink3,      soft: T.paper2,     icon: Circle },
  reserved: { label: "Réservé",  color: T.indigo,    soft: T.indigoSoft, icon: CircleDot },
  done:     { label: "Complété", color: T.matcha,    soft: T.matchaSoft, icon: CircleCheck },
};

// --- Voyageurs (pour le partage type Splitwise) ---
export const PEOPLE = ["Filou", "Kathou"];
export const PERSON_COLOR = {
  "Filou":  T.indigo,
  "Kathou": T.vermilion,
};

// --- Citations japonaises affichées sur le dashboard ---
export const QUOTES = [
  { jp: "一期一会",       romaji: "Ichi-go ichi-e",     fr: "Chaque rencontre est unique, savoure l'instant." },
  { jp: "七転び八起き",   romaji: "Nana korobi ya oki", fr: "Tomber sept fois, se relever huit." },
  { jp: "侘寂",           romaji: "Wabi-sabi",          fr: "La beauté de l'imparfait et de l'éphémère." },
  { jp: "旅は道連れ",     romaji: "Tabi wa michizure",  fr: "En voyage, un compagnon ; dans la vie, la compassion." },
];
