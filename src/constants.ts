import {
  Camera,
  Circle,
  CircleDot,
  CircleCheck,
  Home,
  ShoppingBag,
  Train,
  UtensilsCrossed,
} from "./components/icons";
import type { Category, StatusDef } from "./types";

export const T = {
  paper: "#FAF8F5",
  paper2: "#F2EEE8",
  card: "#FFFFFF",
  ink: "#1C1A17",
  ink2: "#56514A",
  ink3: "#9A9389",
  line: "#E8E2D9",
  vermilion: "#C8443B",
  vermSoft: "#F5E3E0",
  matcha: "#6E7F5C",
  matchaSoft: "#E8EDE2",
  gold: "#B8893E",
  goldSoft: "#F4ECDD",
  indigo: "#3F5169",
  indigoSoft: "#E3E8EE",
  shadowSm: "0 1px 2px rgba(28,26,23,0.04), 0 1px 3px rgba(28,26,23,0.03)",
  shadowMd: "0 2px 8px rgba(28,26,23,0.05), 0 6px 20px rgba(28,26,23,0.05)",
  shadowLg: "0 8px 30px rgba(28,26,23,0.08), 0 20px 50px rgba(28,26,23,0.06)",
} as const;

export const CATS: Record<string, Category> = {
  Transport: { color: T.indigo, soft: T.indigoSoft, icon: Train, label: "Transport" },
  Hébergement: { color: T.matcha, soft: T.matchaSoft, icon: Home, label: "Hébergement" },
  Restaurants: {
    color: T.vermilion,
    soft: T.vermSoft,
    icon: UtensilsCrossed,
    label: "Restaurants",
  },
  Activités: { color: T.gold, soft: T.goldSoft, icon: Camera, label: "Activités" },
  Shopping: { color: "#8A6FA0", soft: "#EFE8F2", icon: ShoppingBag, label: "Shopping" },
  Autres: { color: T.ink3, soft: T.paper2, icon: Circle, label: "Autres" },
};

export const STATUS: Record<string, StatusDef> = {
  todo: { label: "À faire", color: T.ink3, soft: T.paper2, icon: Circle },
  reserved: { label: "Réservé", color: T.indigo, soft: T.indigoSoft, icon: CircleDot },
  done: { label: "Complété", color: T.matcha, soft: T.matchaSoft, icon: CircleCheck },
};

export const PEOPLE = ["Filou", "Kathou"] as const;

export const PERSON_COLOR: Record<string, string> = {
  Filou: T.indigo,
  Kathou: T.vermilion,
};

export interface Quote {
  jp: string;
  romaji: string;
  fr: string;
}

export const QUOTES: Quote[] = [
  {
    jp: "一期一会",
    romaji: "Ichi-go ichi-e",
    fr: "Chaque rencontre est unique, savoure l'instant.",
  },
  { jp: "七転び八起き", romaji: "Nana korobi ya oki", fr: "Tomber sept fois, se relever huit." },
  { jp: "侘寂", romaji: "Wabi-sabi", fr: "La beauté de l'imparfait et de l'éphémère." },
  {
    jp: "旅は道連れ",
    romaji: "Tabi wa michizure",
    fr: "En voyage, un compagnon ; dans la vie, la compassion.",
  },
];
