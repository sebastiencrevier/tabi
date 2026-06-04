// ============================================================
// APP — composant racine : navigation + orchestration des pages
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "./hooks/useStore.js";
import { SEED } from "./data/seed.js";
import { mergeWithSeed } from "./lib/helpers.js";
import { T } from "./constants.js";
import {
  LayoutDashboard, Wallet, Route, MapPin, UtensilsCrossed, BedDouble,
  CheckSquare, NotebookPen, Gift, Camera, Calendar, Plane, X,
} from "./components/icons.js";
import { GlobalStyles } from "./components/GlobalStyles.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Budget } from "./pages/Budget.jsx";
import { Itinerary } from "./pages/Itinerary.jsx";
import { ByDay } from "./pages/ByDay.jsx";
import { Cities } from "./pages/Cities.jsx";
import { Activities } from "./pages/Activities.jsx";
import { Restaurants } from "./pages/Restaurants.jsx";
import { Stays } from "./pages/Stays.jsx";
import { Checklist } from "./pages/Checklist.jsx";
import { Notes } from "./pages/Notes.jsx";
import { Souvenirs } from "./pages/Souvenirs.jsx";

// Configuration des onglets de navigation
const NAV = [
  { id: "dashboard",   label: "Accueil",       icon: LayoutDashboard },
  { id: "budget",      label: "Budget",        icon: Wallet },
  { id: "itinerary",   label: "Itinéraire",    icon: Route },
  { id: "byday",       label: "Par jour",      icon: Calendar },
  { id: "cities",      label: "Villes",        icon: MapPin },
  { id: "activities",  label: "Activités",     icon: Camera },
  { id: "restaurants", label: "Restaurants",   icon: UtensilsCrossed },
  { id: "stays",       label: "Hébergements",  icon: BedDouble },
  { id: "checklist",   label: "Checklist",     icon: CheckSquare },
  { id: "notes",       label: "Journal",       icon: NotebookPen },
  { id: "souvenirs",   label: "Souvenirs",     icon: Gift },
];

export function App() {
  const [rawData, setData, loaded, cloud] = useStore("data", SEED);
  // Garde ultime : data est toujours complet, même si Supabase renvoie partiel
  const data = useMemo(() => mergeWithSeed(rawData, SEED), [rawData]);
  const [page, setPage] = useState("dashboard");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Détection mobile robuste (ne dépend pas que du CSS)
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 860 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 860);
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const totalSpent = useMemo(
    () => (data.expenses || []).reduce((s, e) => s + (e && e.amount ? e.amount : 0), 0),
    [data.expenses]
  );
  const daysLeft = useMemo(() => {
    const sd = data.trip && data.trip.startDate ? data.trip.startDate : SEED.trip.startDate;
    const diff = new Date(sd + "T00:00") - new Date();
    return Math.ceil(diff / 86400000);
  }, [data.trip && data.trip.startDate]);

  const set = (next) => setData(next);

  const pages = {
    dashboard:   <Dashboard data={data} set={set} daysLeft={daysLeft} totalSpent={totalSpent} setPage={setPage} />,
    budget:      <Budget data={data} set={set} totalSpent={totalSpent} />,
    itinerary:   <Itinerary data={data} set={set} />,
    byday:       <ByDay data={data} set={set} />,
    cities:      <Cities data={data} set={set} />,
    activities:  <Activities data={data} set={set} />,
    restaurants: <Restaurants data={data} set={set} />,
    stays:       <Stays data={data} set={set} />,
    checklist:   <Checklist data={data} set={set} />,
    notes:       <Notes data={data} set={set} />,
    souvenirs:   <Souvenirs data={data} set={set} />,
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: T.paper, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: "center", animation: "tabiPulse 1.4s ease-in-out infinite" }}>
          <div style={{ fontSize: 64, fontFamily: "'Fraunces',serif", color: T.vermilion }}>旅</div>
          <div style={{ color: T.ink3, fontSize: 14, marginTop: 8 }}>Chargement de ton voyage…</div>
        </div>
      </div>
    );
  }

  const activeNav = NAV.find((n) => n.id === page);

  // Bandeau cloud (état checking/offline/error)
  const renderCloudBanner = () => {
    if (cloud.status === "online" || bannerDismissed) return null;
    let bg = T.gold, txt = "", icon = "⚠️";
    if (cloud.status === "checking") { bg = T.indigo; icon = "↻"; txt = "Connexion au cloud en cours…"; }
    else if (cloud.status === "offline") { bg = T.ink3; icon = "💾"; txt = "Mode local — données enregistrées sur cet appareil uniquement. " + (cloud.detail || ""); }
    else if (cloud.status === "error") { bg = T.vermilion; icon = "⚠️"; txt = "Cloud indisponible — " + (cloud.detail || "erreur inconnue") + " (les données restent sauvegardées localement)."; }
    return (
      <div style={{
        position: "fixed", left: 0, right: 0, top: 0, zIndex: 200,
        background: bg, color: "#fff", padding: "9px 40px 9px 16px",
        fontSize: 12.5, fontWeight: 600, textAlign: "center",
        fontFamily: "'Outfit', sans-serif", lineHeight: 1.4,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ maxWidth: 760 }}>{txt}</span>
        {cloud.status !== "checking" && (
          <button onClick={() => setBannerDismissed(true)} aria-label="Fermer" style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,.22)", border: "none", color: "#fff",
            cursor: "pointer", width: 22, height: 22, borderRadius: 7,
            display: "grid", placeItems: "center", padding: 0,
          }}>
            <X size={13} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{
      display: "flex", flexDirection: isMobile ? "column" : "row",
      minHeight: "100vh", background: T.paper,
      fontFamily: "'Outfit', sans-serif", color: T.ink,
    }}>
      <GlobalStyles />
      {renderCloudBanner()}

      {/* Sidebar desktop */}
      {!isMobile && (
        <aside className="tabi-sidebar" style={{
          width: 240, flexShrink: 0, background: T.card, borderRight: `1px solid ${T.line}`,
          padding: "26px 16px", position: "sticky", top: 0, height: "100vh",
          overflowY: "auto", display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "0 10px 24px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: T.vermilion,
              display: "grid", placeItems: "center", color: "#fff",
              fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600,
            }}>旅</div>
            <div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, lineHeight: 1 }}>Tabi</div>
              <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>Planificateur Japon</div>
            </div>
          </div>
          <nav style={{ display: "grid", gap: 2, flex: 1 }}>
            {NAV.map((n) => {
              const active = page === n.id;
              return (
                <button key={n.id} onClick={() => setPage(n.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 11, border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: active ? 600 : 500, fontFamily: "inherit",
                  background: active ? T.ink : "transparent", color: active ? "#fff" : T.ink2,
                  transition: "all .15s", textAlign: "left", width: "100%",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.paper2; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <n.icon size={18} strokeWidth={active ? 2.4 : 2} /> {n.label}
                </button>
              );
            })}
          </nav>
          <div style={{ marginTop: 16, padding: 14, background: T.paper, borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: T.ink3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Départ dans</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 600, color: T.vermilion, lineHeight: 1.1 }}>
              {daysLeft > 0 ? daysLeft : 0} <span style={{ fontSize: 14, color: T.ink3 }}>jours</span>
            </div>
          </div>
        </aside>
      )}

      {/* Top bar mobile */}
      {isMobile && (
        <header className="tabi-topbar" style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(255,255,255,.82)", backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top) + 12px) 18px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: T.vermilion,
              display: "grid", placeItems: "center", color: "#fff",
              fontFamily: "'Fraunces',serif", fontSize: 18,
            }}>旅</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 600 }}>{activeNav?.label}</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 11px",
            background: T.vermSoft, borderRadius: 99, color: T.vermilion,
            fontSize: 13, fontWeight: 700,
          }}>
            <Plane size={14} /> J−{daysLeft > 0 ? daysLeft : 0}
          </div>
        </header>
      )}

      {/* Contenu principal */}
      <main className="tabi-main" style={{
        flex: 1, minWidth: 0, width: "100%",
        maxWidth: isMobile ? "100%" : 1180, margin: "0 auto",
        padding: isMobile
          ? "18px 16px calc(100px + env(safe-area-inset-bottom))"
          : "34px 40px 80px",
      }}>
        <div key={page} style={{ animation: "tabiSlide .35s cubic-bezier(.2,.8,.3,1)" }}>
          {pages[page]}
        </div>
      </main>

      {/* Bottom nav mobile */}
      {isMobile && (
        <nav className="tabi-bottomnav" style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
          background: "rgba(255,255,255,.9)", backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)", borderTop: `1px solid ${T.line}`,
          padding: "8px 8px calc(env(safe-area-inset-bottom) + 8px)",
          overflowX: "auto", WebkitOverflowScrolling: "touch",
        }}>
          <div style={{ display: "flex", gap: 4, minWidth: "min-content" }}>
            {NAV.map((n) => {
              const active = page === n.id;
              return (
                <button key={n.id} onClick={() => { setPage(n.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    minWidth: 62, padding: "7px 8px 5px", borderRadius: 14,
                    border: "none", cursor: "pointer",
                    background: active ? T.ink : "transparent",
                    color: active ? "#fff" : T.ink3, fontFamily: "inherit",
                    fontSize: 10.5, fontWeight: 600, flexShrink: 0,
                    transition: "all .18s", WebkitTapHighlightColor: "transparent",
                  }}>
                  <n.icon size={20} strokeWidth={active ? 2.4 : 2} /> {n.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
