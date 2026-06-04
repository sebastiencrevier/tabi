// ============================================================
// PAGE — Itinerary
// ============================================================

import React, { useState } from "react";
import { Calendar, Camera, ChevronDown, GripVertical, Moon, Train, Wallet } from "../components/icons.js";
import { Card } from "../components/ui/Card.jsx";
import { Pill, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { fmt } from "../lib/helpers.js";

export function Itinerary({ data, set }) {
  const { cities, activities, stays, expenses } = data;
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 860;
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);

  const start = new Date(data.trip.startDate + "T00:00");
  const dateFor = (idx) => {
    let d = 0;
    for (let i = 0; i < idx; i++) d += cities[i].nights;
    const dt = new Date(start); dt.setDate(dt.getDate() + d);
    return dt;
  };

  const cityBudget = (id) => {
    const act = activities.filter((a) => a.cityId === id).reduce((s, a) => s + a.cost, 0);
    const stay = stays.filter((h) => h.cityId === id).reduce((s, h) => s + h.price, 0);
    return act + stay;
  };

  const reorder = (from, to) => {
    if (from === to || from < 0 || to < 0 || to >= cities.length) return;
    const next = [...cities];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set({ ...data, cities: next });
  };
  const move = (i, dir) => reorder(i, i + dir); // dir = -1 (haut) ou +1 (bas)

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Parcours" title="Itinéraire" sub={`${cities.length} étapes · ${totalNights} nuits · ${isMobile ? "utilise les flèches pour réordonner" : "glisse les cartes pour réorganiser"}`} />

      {/* Barre proportionnelle */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 38 }}>
          {cities.map((c, i) => (
            <div key={c.id} title={`${c.name} — ${c.nights} nuits`} style={{
              flex: c.nights, background: i % 2 ? T.indigo : T.vermilion, display: "grid", placeItems: "center",
              color: "#fff", fontSize: 12, fontWeight: 600, opacity: 0.92, borderRight: "2px solid #fff",
            }}>{c.nights >= 2 ? c.name : c.name.slice(0, 3)}</div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.ink3 }}>
          <span>{start.toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</span>
          <span>Largeur ∝ nombre de nuits</span>
          <span>{dateFor(cities.length).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</span>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 12 }}>
        {cities.map((c, i) => {
          const acts = activities.filter((a) => a.cityId === c.id);
          const isDragging = dragId === c.id;
          const isOver = overId === c.id;
          return (
            <div key={c.id}
              draggable={!isMobile}
              onDragStart={!isMobile ? () => setDragId(c.id) : undefined}
              onDragEnd={!isMobile ? () => { setDragId(null); setOverId(null); } : undefined}
              onDragOver={!isMobile ? (e) => { e.preventDefault(); setOverId(c.id); } : undefined}
              onDrop={!isMobile ? () => { reorder(cities.findIndex((x) => x.id === dragId), i); setOverId(null); } : undefined}
              style={{
                opacity: isDragging ? 0.4 : 1,
                transform: isOver && !isDragging ? "scale(1.01)" : "none",
                transition: "all .18s",
              }}>
              <Card style={{ padding: 0, overflow: "hidden", border: isOver ? `2px solid ${T.vermilion}` : `1px solid ${T.line}` }}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  {/* Poignée + numéro + flèches mobile */}
                  <div style={{ width: isMobile ? 50 : 56, background: i % 2 ? T.indigoSoft : T.vermSoft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: isMobile ? "default" : "grab" }}>
                    {isMobile ? (
                      <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" style={{
                        background: i === 0 ? "transparent" : T.card, border: "none", borderRadius: 8,
                        width: 34, height: 30, cursor: i === 0 ? "default" : "pointer", display: "grid", placeItems: "center",
                        color: i === 0 ? T.line : (i % 2 ? T.indigo : T.vermilion), boxShadow: i === 0 ? "none" : T.shadowSm,
                      }}><ChevronDown size={18} style={{ transform: "rotate(180deg)" }} /></button>
                    ) : (
                      <GripVertical size={16} color={T.ink3} />
                    )}
                    <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: i % 2 ? T.indigo : T.vermilion }}>{i + 1}</div>
                    {isMobile && (
                      <button onClick={() => move(i, 1)} disabled={i === cities.length - 1} aria-label="Descendre" style={{
                        background: i === cities.length - 1 ? "transparent" : T.card, border: "none", borderRadius: 8,
                        width: 34, height: 30, cursor: i === cities.length - 1 ? "default" : "pointer", display: "grid", placeItems: "center",
                        color: i === cities.length - 1 ? T.line : (i % 2 ? T.indigo : T.vermilion), boxShadow: i === cities.length - 1 ? "none" : T.shadowSm,
                      }}><ChevronDown size={18} /></button>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                          <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 22, color: T.ink }}>{c.name}</h3>
                          <span style={{ color: T.ink3, fontSize: 16 }}>{c.jp}</span>
                        </div>
                        <div style={{ fontSize: 13, color: T.ink2, marginTop: 4 }}>{c.note}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Pill icon={Calendar} color={T.indigo} soft={T.indigoSoft}>{dateFor(i).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</Pill>
                        <Pill icon={Moon} color={T.ink2} soft={T.paper2}>{c.nights} {c.nights > 1 ? "nuits" : "nuit"}</Pill>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap", fontSize: 13, color: T.ink2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Camera size={14} color={T.gold} /> {acts.length} activités</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Wallet size={14} color={T.matcha} /> ~{fmt(cityBudget(c.id))} $ estimés</span>
                    </div>
                  </div>
                </div>
              </Card>
              {i < cities.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 0 28px", color: T.ink3, fontSize: 12 }}>
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

/* ---------- VILLES (gestion + ajout) ---------- */
