// ============================================================
// PAGE — ByDay
// ============================================================

import React, { useMemo, useState } from "react";
import { ExternalLink } from "../components/ExternalLink.jsx";
import { StayAssignRow } from "../components/StayAssignRow.jsx";
import { BedDouble, Calendar, Camera, MapPin, Plus, UtensilsCrossed, X } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Empty, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { fmt } from "../lib/helpers.js";

export function ByDay({ data, set }) {
  const { trip, cities, activities, restaurants, stays } = data;
  const [selectedDay, setSelectedDay] = useState(1);
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);
  const totalDays = totalNights + 1; // ex : 20 nuits = 21 jours

  // Calcule pour chaque jour : la date, la ville où on dort, la ville visitée
  const dayInfo = useMemo(() => {
    const start = new Date(trip.startDate + "T00:00");
    const info = [];
    let nightCounter = 0;
    cities.forEach((c, ci) => {
      for (let n = 0; n < c.nights; n++) {
        const dt = new Date(start);
        dt.setDate(dt.getDate() + nightCounter);
        info.push({ day: nightCounter + 1, date: dt, city: c, cityIndex: ci, isFirstInCity: n === 0 });
        nightCounter++;
      }
    });
    // Dernier jour (retour)
    const dtLast = new Date(start);
    dtLast.setDate(dtLast.getDate() + nightCounter);
    info.push({ day: nightCounter + 1, date: dtLast, city: cities[cities.length - 1], cityIndex: cities.length - 1, isFirstInCity: false, isReturn: true });
    return info;
  }, [trip.startDate, cities]);

  const current = dayInfo.find((d) => d.day === selectedDay) || dayInfo[0];

  // Items assignés à ce jour
  const dayActs = activities.filter((a) => a.day === selectedDay);
  const dayRestos = restaurants.filter((r) => r.day === selectedDay);
  // Hôtels : multi-nuits. days est un tableau. Rétro-compat avec ancien `day` (numéro).
  const stayDays = (h) => Array.isArray(h.days) ? h.days : (h.day ? [h.day] : []);
  const dayStays = stays.filter((h) => stayDays(h).includes(selectedDay));

  // Items du catalogue à assigner (filtrés sur la ville du jour pour pertinence)
  const cityActs = activities.filter((a) => a.cityId === (current && current.city.id) && !a.day);
  const cityRestos = restaurants.filter((r) => r.cityId === (current && current.city.id) && !r.day);
  // Hôtels disponibles : ceux de la ville qui ne sont PAS déjà sur ce jour (mais peuvent être sur d'autres jours)
  const cityStays = stays.filter((h) => h.cityId === (current && current.city.id) && !stayDays(h).includes(selectedDay));

  const assignActivity = (id) => set({ ...data, activities: activities.map((a) => a.id === id ? { ...a, day: selectedDay } : a) });
  const unassignActivity = (id) => set({ ...data, activities: activities.map((a) => a.id === id ? { ...a, day: null } : a) });
  const assignResto = (id) => set({ ...data, restaurants: restaurants.map((r) => r.id === id ? { ...r, day: selectedDay } : r) });
  const unassignResto = (id) => set({ ...data, restaurants: restaurants.map((r) => r.id === id ? { ...r, day: null } : r) });
  // Assigner un hôtel : on AJOUTE le jour à son tableau days. On migre aussi l'ancien `day` au passage.
  const assignStay = (id, nbNights = 1) => {
    const target = stays.find((h) => h.id === id);
    if (!target) return;
    const existing = stayDays(target);
    const toAdd = [];
    for (let i = 0; i < nbNights; i++) {
      const d = selectedDay + i;
      if (!existing.includes(d) && d <= totalDays) toAdd.push(d);
    }
    const newDays = [...existing, ...toAdd].sort((a, b) => a - b);
    set({ ...data, stays: stays.map((h) => h.id === id ? { ...h, days: newDays, day: undefined } : h) });
  };
  const unassignStay = (id) => {
    const target = stays.find((h) => h.id === id);
    if (!target) return;
    const newDays = stayDays(target).filter((d) => d !== selectedDay);
    set({ ...data, stays: stays.map((h) => h.id === id ? { ...h, days: newDays, day: undefined } : h) });
  };

  if (!current) return <Empty icon={Calendar} text="Aucune journée à afficher. Définis ta date de départ et tes villes d'abord." />;

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Déroulé" title="Par jour" sub={`${totalDays} journées · clique sur un jour pour voir ce qui s'y passe`} />

      {/* Sélecteur de jour horizontal */}
      <Card style={{ padding: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
          {dayInfo.map((d) => {
            const active = d.day === selectedDay;
            const cityChange = d.isFirstInCity || d.isReturn;
            return (
              <button key={d.day} onClick={() => setSelectedDay(d.day)} style={{
                flexShrink: 0, minWidth: 64, padding: "10px 8px", borderRadius: 12, border: "none",
                background: active ? T.ink : (cityChange ? T.vermSoft : T.paper2),
                color: active ? "#fff" : (cityChange ? T.vermilion : T.ink2),
                cursor: "pointer", fontFamily: "inherit", textAlign: "center",
                boxShadow: active ? T.shadowMd : "none", transition: "all .18s",
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, opacity: .8, textTransform: "uppercase", letterSpacing: 0.5 }}>Jour</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", lineHeight: 1 }}>{d.day}</div>
                <div style={{ fontSize: 10, marginTop: 4, opacity: .85 }}>{d.date.toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</div>
                {cityChange && <div style={{ fontSize: 9, marginTop: 2, fontWeight: 600 }}>{d.isReturn ? "Retour" : d.city.name}</div>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* En-tête du jour sélectionné */}
      <Card style={{ padding: 22, background: `linear-gradient(135deg, ${T.card} 0%, ${current.cityIndex % 2 ? T.indigoSoft : T.vermSoft} 130%)` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.vermilion, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
          Jour {current.day} {current.isReturn ? "— Départ" : ""}
        </div>
        <h2 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 28, color: T.ink, letterSpacing: -0.5 }}>
          {current.date.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        <div style={{ fontSize: 14, color: T.ink2, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={14} color={T.vermilion} /> {current.city.name} <span style={{ color: T.ink3 }}>{current.city.jp}</span>
        </div>
      </Card>

      {/* HÉBERGEMENT du jour */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BedDouble size={18} color={T.matcha} />
          <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 17, color: T.ink }}>Hébergement de la nuit</h3>
        </div>
        {dayStays.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {dayStays.map((h) => {
              const nights = stayDays(h);
              const sorted = [...nights].sort((a, b) => a - b);
              const isRange = sorted.length > 1;
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, background: T.paper, borderRadius: 12 }}>
                  {h.photo && <img src={h.photo} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: T.ink3 }}>{h.area} · {fmt(h.price)} $/nuit{isRange ? ` · ${nights.length} nuits (J${sorted[0]} → J${sorted[sorted.length - 1]})` : ""}</div>
                    {h.url && <div style={{ marginTop: 4 }} onClick={(e) => e.stopPropagation()}><ExternalLink url={h.url} label="Voir / réserver" /></div>}
                  </div>
                  <Btn variant="ghost" size="sm" onClick={() => unassignStay(h.id)} title="Retirer de cette nuit"><X size={14} /></Btn>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: T.ink3, marginBottom: 10 }}>Aucun hébergement assigné à ce jour.</div>
        )}
        {cityStays.length > 0 && (
          <div style={{ display: "grid", gap: 6, marginTop: dayStays.length > 0 ? 14 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.5 }}>{dayStays.length > 0 ? "Ajouter un autre hôtel" : "Hôtels disponibles à " + current.city.name}</div>
            {cityStays.map((h) => (
              <StayAssignRow key={h.id} stay={h} maxNights={totalDays - selectedDay + 1} onAssign={(n) => assignStay(h.id, n)} />
            ))}
          </div>
        )}
      </Card>

      {/* ACTIVITÉS du jour */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Camera size={18} color={T.gold} />
          <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 17, color: T.ink }}>Activités du jour ({dayActs.length})</h3>
        </div>
        {dayActs.length > 0 && (
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {dayActs.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: T.paper, borderRadius: 12 }}>
                {a.photo && <img src={a.photo} alt="" style={{ width: 48, height: 48, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: T.ink3 }}>{a.hours ? a.hours + "h · " : ""}{a.cost ? fmt(a.cost) + " $" : "Gratuit"}{a.url ? " · " : ""}{a.url && <ExternalLink url={a.url} label="lien" />}</div>
                </div>
                <button onClick={() => unassignActivity(a.id)} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer", padding: 4 }}><X size={15} /></button>
              </div>
            ))}
          </div>
        )}
        {cityActs.length > 0 ? (
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.5 }}>À assigner à ce jour (à {current.city.name})</div>
            {cityActs.map((a) => (
              <button key={a.id} onClick={() => assignActivity(a.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: 10, border: `1px dashed ${T.line}`,
                background: T.paper, borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              }}>
                <Plus size={14} color={T.gold} />
                <span style={{ flex: 1, fontSize: 14, color: T.ink }}>{a.title}</span>
                <span style={{ fontSize: 12, color: T.ink3 }}>{a.hours}h</span>
              </button>
            ))}
          </div>
        ) : dayActs.length === 0 && (
          <div style={{ fontSize: 13, color: T.ink3 }}>Aucune activité prévue. Ajoute-en dans l'onglet « Activités ».</div>
        )}
      </Card>

      {/* RESTAURANTS du jour */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <UtensilsCrossed size={18} color={T.vermilion} />
          <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 17, color: T.ink }}>Restaurants du jour ({dayRestos.length})</h3>
        </div>
        {dayRestos.length > 0 && (
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {dayRestos.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: T.paper, borderRadius: 12 }}>
                {r.photo && <img src={r.photo} alt="" style={{ width: 48, height: 48, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: T.ink3 }}>{r.cuisine} · {fmt(r.avg)} $</div>
                </div>
                <button onClick={() => unassignResto(r.id)} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer", padding: 4 }}><X size={15} /></button>
              </div>
            ))}
          </div>
        )}
        {cityRestos.length > 0 ? (
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.5 }}>À assigner à ce jour (à {current.city.name})</div>
            {cityRestos.map((r) => (
              <button key={r.id} onClick={() => assignResto(r.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: 10, border: `1px dashed ${T.line}`,
                background: T.paper, borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              }}>
                <Plus size={14} color={T.vermilion} />
                <span style={{ flex: 1, fontSize: 14, color: T.ink }}>{r.name}</span>
                <span style={{ fontSize: 12, color: T.ink3 }}>{r.cuisine}</span>
              </button>
            ))}
          </div>
        ) : dayRestos.length === 0 && (
          <div style={{ fontSize: 13, color: T.ink3 }}>Aucun restaurant prévu. Ajoute-en dans l'onglet « Restaurants ».</div>
        )}
      </Card>
    </div>
  );
}

/* ---------- WISHLIST SOUVENIRS ---------- */
