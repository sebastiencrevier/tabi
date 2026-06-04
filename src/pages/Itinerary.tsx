import { useState } from "react";
import {
  Calendar,
  Camera,
  ChevronDown,
  GripVertical,
  Moon,
  Train,
  Wallet,
} from "../components/icons";
import { Card } from "../components/ui/Card";
import { Pill, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { fmt } from "../lib/helpers";
import type { AppData } from "../types";

interface ItineraryProps {
  data: AppData;
  set: (d: AppData) => void;
}

export function Itinerary({ data, set }: ItineraryProps) {
  const { cities, activities, stays, expenses } = data;
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 860;
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);

  const start = new Date(data.trip.startDate + "T00:00");
  const dateFor = (idx: number) => {
    let d = 0;
    for (let i = 0; i < idx; i++) d += cities[i].nights;
    const dt = new Date(start);
    dt.setDate(dt.getDate() + d);
    return dt;
  };

  const cityBudget = (id: string) => {
    const act = activities.filter((a) => a.cityId === id).reduce((s, a) => s + (a.cost || 0), 0);
    const stay = stays.filter((h) => h.cityId === id).reduce((s, h) => s + (h.price || 0), 0);
    return act + stay;
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= cities.length) return;
    const next = [...cities];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set({ ...data, cities: next });
  };
  const move = (i: number, dir: number) => reorder(i, i + dir);

  // suppress unused warning
  void expenses;

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Parcours"
        title="Itinéraire"
        sub={`${cities.length} étapes · ${totalNights} nuits · ${isMobile ? "utilise les flèches pour réordonner" : "glisse les cartes pour réorganiser"}`}
      />

      {/* Proportional bar */}
      <Card className="p-5">
        <div className="flex rounded-[10px] overflow-hidden h-[38px]">
          {cities.map((c, i) => (
            <div
              key={c.id}
              title={`${c.name} — ${c.nights} nuits`}
              className="grid place-items-center text-white text-[12px] font-semibold border-r-2 border-white"
              style={{ flex: c.nights, background: i % 2 ? T.indigo : T.vermilion, opacity: 0.92 }}
            >
              {c.nights >= 2 ? c.name : c.name.slice(0, 3)}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[12px] text-ink3">
          <span>{start.toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</span>
          <span>Largeur ∝ nombre de nuits</span>
          <span>
            {dateFor(cities.length).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}
          </span>
        </div>
      </Card>

      <div className="grid gap-3">
        {cities.map((c, i) => {
          const acts = activities.filter((a) => a.cityId === c.id);
          const isDragging = dragId === c.id;
          const isOver = overId === c.id;
          return (
            <div
              key={c.id}
              draggable={!isMobile}
              onDragStart={!isMobile ? () => setDragId(c.id) : undefined}
              onDragEnd={
                !isMobile
                  ? () => {
                      setDragId(null);
                      setOverId(null);
                    }
                  : undefined
              }
              onDragOver={
                !isMobile
                  ? (e) => {
                      e.preventDefault();
                      setOverId(c.id);
                    }
                  : undefined
              }
              onDrop={
                !isMobile
                  ? () => {
                      reorder(
                        cities.findIndex((x) => x.id === dragId),
                        i
                      );
                      setOverId(null);
                    }
                  : undefined
              }
              style={{
                opacity: isDragging ? 0.4 : 1,
                transform: isOver && !isDragging ? "scale(1.01)" : "none",
                transition: "all .18s",
              }}
            >
              <Card
                style={{
                  padding: 0,
                  overflow: "hidden",
                  border: isOver ? `2px solid ${T.vermilion}` : `1px solid ${T.line}`,
                }}
              >
                <div className="flex items-stretch">
                  <div
                    className="flex flex-col items-center justify-center gap-1"
                    style={{
                      width: isMobile ? 50 : 56,
                      background: i % 2 ? T.indigoSoft : T.vermSoft,
                      cursor: isMobile ? "default" : "grab",
                    }}
                  >
                    {isMobile ? (
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Monter"
                        className="grid place-items-center rounded-[8px] w-[34px] h-[30px] border-none"
                        style={{
                          background: i === 0 ? "transparent" : T.card,
                          cursor: i === 0 ? "default" : "pointer",
                          color: i === 0 ? T.line : i % 2 ? T.indigo : T.vermilion,
                          boxShadow: i === 0 ? "none" : T.shadowSm,
                        }}
                      >
                        <ChevronDown size={18} style={{ transform: "rotate(180deg)" }} />
                      </button>
                    ) : (
                      <GripVertical size={16} color={T.ink3} />
                    )}
                    <div
                      className="font-bold font-serif"
                      style={{
                        fontSize: isMobile ? 18 : 22,
                        color: i % 2 ? T.indigo : T.vermilion,
                      }}
                    >
                      {i + 1}
                    </div>
                    {isMobile && (
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === cities.length - 1}
                        aria-label="Descendre"
                        className="grid place-items-center rounded-[8px] w-[34px] h-[30px] border-none"
                        style={{
                          background: i === cities.length - 1 ? "transparent" : T.card,
                          cursor: i === cities.length - 1 ? "default" : "pointer",
                          color: i === cities.length - 1 ? T.line : i % 2 ? T.indigo : T.vermilion,
                          boxShadow: i === cities.length - 1 ? "none" : T.shadowSm,
                        }}
                      >
                        <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 p-[18px_22px]">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="m-0 font-serif text-[22px] text-ink">{c.name}</h3>
                          <span className="text-ink3 text-[16px]">{c.jp}</span>
                        </div>
                        <div className="text-[13px] text-ink2 mt-1">{c.note}</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Pill icon={Calendar} color={T.indigo} soft={T.indigoSoft}>
                          {dateFor(i).toLocaleDateString("fr-CA", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Pill>
                        <Pill icon={Moon} color={T.ink2} soft={T.paper2}>
                          {c.nights} {c.nights > 1 ? "nuits" : "nuit"}
                        </Pill>
                      </div>
                    </div>
                    <div className="flex gap-[18px] mt-3.5 flex-wrap text-[13px] text-ink2">
                      <span className="flex items-center gap-[5px]">
                        <Camera size={14} color={T.gold} /> {acts.length} activités
                      </span>
                      <span className="flex items-center gap-[5px]">
                        <Wallet size={14} color={T.matcha} /> ~{fmt(cityBudget(c.id))} $ estimés
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              {i < cities.length - 1 && (
                <div className="flex items-center gap-2 pt-2 pl-7 text-ink3 text-[12px]">
                  <Train size={14} /> <span>Trajet vers {cities[i + 1].name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
