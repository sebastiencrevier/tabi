import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "./hooks/useStore";
import { SEED } from "./data/seed";
import { mergeWithSeed } from "./lib/helpers";
import { T } from "./constants";
import {
  LayoutDashboard,
  Wallet,
  Route,
  MapPin,
  UtensilsCrossed,
  BedDouble,
  CheckSquare,
  NotebookPen,
  Gift,
  Camera,
  Calendar,
  Plane,
  X,
} from "./components/icons";
import { GlobalStyles } from "./components/GlobalStyles";
import { Dashboard } from "./pages/Dashboard";
import { Budget } from "./pages/Budget";
import { Itinerary } from "./pages/Itinerary";
import { ByDay } from "./pages/ByDay";
import { Cities } from "./pages/Cities";
import { Activities } from "./pages/Activities";
import { Restaurants } from "./pages/Restaurants";
import { Stays } from "./pages/Stays";
import { Checklist } from "./pages/Checklist";
import { Notes } from "./pages/Notes";
import { Souvenirs } from "./pages/Souvenirs";
import type { AppData } from "./types";
import type { IconComponent } from "./components/icons";

interface NavItem {
  id: string;
  label: string;
  icon: IconComponent;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Accueil", icon: LayoutDashboard },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "itinerary", label: "Itinéraire", icon: Route },
  { id: "byday", label: "Par jour", icon: Calendar },
  { id: "cities", label: "Villes", icon: MapPin },
  { id: "activities", label: "Activités", icon: Camera },
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { id: "stays", label: "Hébergements", icon: BedDouble },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "notes", label: "Journal", icon: NotebookPen },
  { id: "souvenirs", label: "Souvenirs", icon: Gift },
];

export function App() {
  const [rawData, setData, loaded, cloud] = useStore<AppData>("data", SEED);
  const data = useMemo(() => mergeWithSeed(rawData, SEED), [rawData]);
  const [page, setPage] = useState("dashboard");
  const [bannerDismissed, setBannerDismissed] = useState(false);

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
    const diff = new Date(sd + "T00:00").getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  }, [data.trip?.startDate]);

  const set = (next: AppData) => setData(next);

  const pages: Record<string, React.ReactNode> = {
    dashboard: (
      <Dashboard
        data={data}
        set={set}
        daysLeft={daysLeft}
        totalSpent={totalSpent}
        setPage={setPage}
      />
    ),
    budget: <Budget data={data} set={set} totalSpent={totalSpent} />,
    itinerary: <Itinerary data={data} set={set} />,
    byday: <ByDay data={data} set={set} />,
    cities: <Cities data={data} set={set} />,
    activities: <Activities data={data} set={set} />,
    restaurants: <Restaurants data={data} set={set} />,
    stays: <Stays data={data} set={set} />,
    checklist: <Checklist data={data} set={set} />,
    notes: <Notes data={data} set={set} />,
    souvenirs: <Souvenirs data={data} set={set} />,
  };

  if (!loaded) {
    return (
      <div
        className="min-h-screen grid place-items-center font-sans"
        style={{ background: T.paper }}
      >
        <div className="text-center animate-tabi-pulse">
          <div className="text-[64px] font-serif leading-none" style={{ color: T.vermilion }}>
            旅
          </div>
          <div className="text-[14px] mt-2" style={{ color: T.ink3 }}>
            Chargement de ton voyage…
          </div>
        </div>
      </div>
    );
  }

  const activeNav = NAV.find((n) => n.id === page);

  const renderCloudBanner = () => {
    if (cloud.status === "online" || bannerDismissed) return null;
    let bg: string = T.gold,
      txt = "",
      icon = "⚠️";
    if (cloud.status === "checking") {
      bg = T.indigo;
      icon = "↻";
      txt = "Connexion au cloud en cours…";
    } else if (cloud.status === "offline") {
      bg = T.ink3;
      icon = "💾";
      txt =
        "Mode local — données enregistrées sur cet appareil uniquement. " + (cloud.detail || "");
    } else if (cloud.status === "error") {
      bg = T.vermilion;
      icon = "⚠️";
      txt =
        "Cloud indisponible — " +
        (cloud.detail || "erreur inconnue") +
        " (les données restent sauvegardées localement).";
    }
    return (
      <div
        className="fixed left-0 right-0 top-0 z-[200] text-white flex items-center justify-center gap-2 text-[12.5px] font-semibold text-center leading-snug"
        style={{ background: bg, padding: "9px 40px 9px 16px", fontFamily: "'Outfit', sans-serif" }}
      >
        <span className="text-[14px]">{icon}</span>
        <span style={{ maxWidth: 760 }}>{txt}</span>
        {cloud.status !== "checking" && (
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Fermer"
            className="absolute right-3 top-1/2 -translate-y-1/2 border-none text-white cursor-pointer w-[22px] h-[22px] rounded-[7px] grid place-items-center p-0"
            style={{ background: "rgba(255,255,255,.22)" }}
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        flexDirection: isMobile ? "column" : "row",
        background: T.paper,
        color: T.ink,
      }}
    >
      <GlobalStyles />
      {renderCloudBanner()}

      {/* Sidebar desktop */}
      {!isMobile && (
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            background: T.card,
            borderRight: `1px solid ${T.line}`,
            padding: "26px 16px",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="px-[10px] pb-6 flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-[12px] grid place-items-center text-white font-serif text-[24px] font-semibold"
              style={{ background: T.vermilion }}
            >
              旅
            </div>
            <div>
              <div className="font-serif text-[20px] font-semibold leading-none">Tabi</div>
              <div className="text-[11px] text-ink3 mt-0.5">Planificateur Japon</div>
            </div>
          </div>
          <nav className="grid gap-0.5 flex-1">
            {NAV.map((n) => {
              const active = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setPage(n.id)}
                  className="flex items-center gap-3 px-3 py-[10px] rounded-[11px] border-none cursor-pointer text-[14px] text-left w-full transition-all font-sans"
                  style={{
                    fontWeight: active ? 600 : 500,
                    background: active ? T.ink : "transparent",
                    color: active ? "#fff" : T.ink2,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = T.paper2;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <n.icon size={18} strokeWidth={active ? 2.4 : 2} /> {n.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 p-3.5 rounded-[14px]" style={{ background: T.paper }}>
            <div className="text-[11px] text-ink3 font-semibold uppercase tracking-[0.5px]">
              Départ dans
            </div>
            <div
              className="font-serif text-[28px] font-semibold leading-[1.1]"
              style={{ color: T.vermilion }}
            >
              {daysLeft > 0 ? daysLeft : 0} <span className="text-[14px] text-ink3">jours</span>
            </div>
          </div>
        </aside>
      )}

      {/* Top bar mobile */}
      {isMobile && (
        <header
          className="tabi-topbar sticky top-0 z-50 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,.82)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: `1px solid ${T.line}`,
            padding: "calc(env(safe-area-inset-top) + 12px) 18px 12px",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[9px] grid place-items-center text-white font-serif text-[18px]"
              style={{ background: T.vermilion }}
            >
              旅
            </div>
            <span className="font-serif text-[19px] font-semibold">{activeNav?.label}</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-[11px] py-[6px] rounded-full text-[13px] font-bold"
            style={{ background: T.vermSoft, color: T.vermilion }}
          >
            <Plane size={14} /> J−{daysLeft > 0 ? daysLeft : 0}
          </div>
        </header>
      )}

      {/* Main content */}
      <main
        className="tabi-main flex-1 min-w-0 w-full"
        style={{
          maxWidth: isMobile ? "100%" : 1180,
          margin: "0 auto",
          padding: isMobile
            ? "18px 16px calc(100px + env(safe-area-inset-bottom))"
            : "34px 40px 80px",
        }}
      >
        <div key={page} style={{ animation: "tabiSlide .35s cubic-bezier(.2,.8,.3,1)" }}>
          {pages[page]}
        </div>
      </main>

      {/* Bottom nav mobile */}
      {isMobile && (
        <nav
          className="tabi-bottomnav fixed left-0 right-0 bottom-0 z-50 overflow-x-auto"
          style={{
            background: "rgba(255,255,255,.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: `1px solid ${T.line}`,
            padding: "8px 8px calc(env(safe-area-inset-bottom) + 8px)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex gap-1" style={{ minWidth: "min-content" }}>
            {NAV.map((n) => {
              const active = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    setPage(n.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex flex-col items-center gap-[3px] min-w-[62px] px-2 pt-[7px] pb-[5px] rounded-[14px] border-none cursor-pointer font-sans text-[10.5px] font-semibold shrink-0 transition-all"
                  style={{
                    background: active ? T.ink : "transparent",
                    color: active ? "#fff" : T.ink3,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
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
