// ============================================================
// PAGE — Dashboard
// ============================================================

import React, { useState } from "react";
import { ArrowRight, Calendar, Edit3, Quote, Star, TrendingUp, Wallet } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Field, Modal, Pill } from "../components/ui/index.jsx";
import { QUOTES, STATUS, T } from "../constants.js";
import { fmt } from "../lib/helpers.js";

export function Dashboard({ data, set, daysLeft, totalSpent, setPage }) {
  const { trip, cities, activities, expenses } = data;
  const remaining = trip.budget - totalSpent;
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);
  const upcoming = activities.filter((a) => a.status !== "done").slice(0, 4);
  const quote = QUOTES[daysLeft % QUOTES.length];
  const pctSpent = trip.budget ? (totalSpent / trip.budget) * 100 : 0;

  const [editTrip, setEditTrip] = useState(false);
  const [tripForm, setTripForm] = useState({ title: trip.title, subtitle: trip.subtitle, startDate: trip.startDate });
  const openEdit = () => { setTripForm({ title: trip.title, subtitle: trip.subtitle, startDate: trip.startDate }); setEditTrip(true); };
  const saveTrip = () => { set({ ...data, trip: { ...trip, title: tripForm.title, subtitle: tripForm.subtitle, startDate: tripForm.startDate } }); setEditTrip(false); };

  const stat = (label, value, sub, color, Icon) => (
    <Card style={{ padding: 22 }} hover>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: color + "18", display: "grid", placeItems: "center", color }}>
          <Icon size={17} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: T.ink, marginTop: 12, fontFamily: "'Fraunces', serif", letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: T.ink2, marginTop: 2 }}>{sub}</div>}
    </Card>
  );

  return (
    <div style={{ display: "grid", gap: 22 }}>
      {/* Hero */}
      <Card style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        <div style={{ background: `linear-gradient(135deg, ${T.ink} 0%, #2C2925 55%, ${T.indigo} 130%)`, padding: "38px 34px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -40, fontSize: 220, opacity: 0.06, fontFamily: "'Fraunces',serif", lineHeight: 1, userSelect: "none" }}>旅</div>
          <button onClick={openEdit} title="Modifier le voyage" style={{
            position: "absolute", right: 18, top: 18, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)", color: "#fff",
            borderRadius: 99, padding: "7px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            backdropFilter: "blur(4px)",
          }}><Edit3 size={14} /> Modifier</button>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#E8B4AE", marginBottom: 10 }}>Voyage à venir</div>
          <h1 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 44, letterSpacing: -1 }}>{trip.title} <span style={{ opacity: .5, fontSize: 30 }}>日本</span></h1>
          <p style={{ margin: "8px 0 22px", opacity: .8, fontSize: 15 }}>{trip.subtitle} · {totalNights} nuits · {cities.length} villes</p>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Fraunces',serif", lineHeight: 1 }}>{daysLeft > 0 ? daysLeft : 0}</div>
              <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{daysLeft > 0 ? "jours avant le départ" : "en voyage !"}</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,.15)" }} />
            <button onClick={openEdit} style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>
              <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Fraunces',serif", lineHeight: 1, display: "flex", alignItems: "center", gap: 8 }}>
                {new Date(trip.startDate + "T00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}
                <Edit3 size={15} style={{ opacity: .55 }} />
              </div>
              <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>date de départ · {new Date(trip.startDate + "T00:00").getFullYear()}</div>
            </button>
          </div>
        </div>
      </Card>

      <Modal open={editTrip} onClose={() => setEditTrip(false)} title="Modifier le voyage"
        footer={<><Btn variant="ghost" onClick={() => setEditTrip(false)}>Annuler</Btn><Btn variant="accent" onClick={saveTrip}>Enregistrer</Btn></>}>
        <Field label="Date de départ" type="date" value={tripForm.startDate} onChange={(v) => setTripForm({ ...tripForm, startDate: v })} />
        <Field label="Titre du voyage" value={tripForm.title} onChange={(v) => setTripForm({ ...tripForm, title: v })} placeholder="ex : Japon" />
        <Field label="Sous-titre" value={tripForm.subtitle} onChange={(v) => setTripForm({ ...tripForm, subtitle: v })} placeholder="ex : Trois semaines" />
        <div style={{ fontSize: 12, color: T.ink3, lineHeight: 1.5, background: T.paper, padding: "10px 12px", borderRadius: 10 }}>
          La date de départ met à jour le compte à rebours et toutes les dates de l'itinéraire automatiquement.
        </div>
      </Modal>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
        {stat("Budget total", fmt(trip.budget) + " $", "défini pour le séjour", T.gold, Wallet)}
        {stat("Dépensé", fmt(totalSpent) + " $", `${Math.round(pctSpent)}% du budget`, T.vermilion, TrendingUp)}
        {stat("Restant", fmt(remaining) + " $", remaining < 0 ? "dépassement !" : "à dépenser", remaining < 0 ? T.vermilion : T.matcha, Wallet)}
        {stat("Par jour", fmt(remaining > 0 ? remaining / Math.max(totalNights, 1) : 0) + " $", "budget journalier restant", T.indigo, Calendar)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }} className="tabi-2col">
        {/* Timeline */}
        <Card style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink }}>Timeline du voyage</h3>
            <Btn variant="ghost" size="sm" onClick={() => setPage("itinerary")}>Détails <ArrowRight size={14} /></Btn>
          </div>
          <div style={{ display: "grid", gap: 2 }}>
            {cities.map((c, i) => (
              <div key={c.id} style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 11, height: 11, borderRadius: 99, background: T.vermilion, flexShrink: 0, marginTop: 4, boxShadow: `0 0 0 4px ${T.vermSoft}` }} />
                  {i < cities.length - 1 && <div style={{ width: 2, flex: 1, background: T.line, margin: "2px 0" }} />}
                </div>
                <div style={{ paddingBottom: 18, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 600, color: T.ink, fontSize: 15 }}>{c.name} <span style={{ color: T.ink3, fontWeight: 400, fontSize: 13 }}>{c.jp}</span></span>
                    <Pill color={T.indigo} soft={T.indigoSoft}>{c.nights} {c.nights > 1 ? "nuits" : "nuit"}</Pill>
                  </div>
                  <div style={{ fontSize: 13, color: T.ink2, marginTop: 3 }}>{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Côté droit */}
        <div style={{ display: "grid", gap: 22, alignContent: "start" }}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink }}>Prochaines activités</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {upcoming.map((a) => {
                const city = cities.find((c) => c.id === a.cityId);
                const st = STATUS[a.status];
                return (
                  <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", background: T.paper, borderRadius: 12 }}>
                    <div style={{ color: st.color }}><st.icon size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: T.ink3 }}>{city?.name} · {a.hours}h</div>
                    </div>
                    {a.fav && <Star size={15} fill={T.gold} stroke={T.gold} />}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 24, background: `linear-gradient(160deg, ${T.paper} 0%, ${T.goldSoft} 120%)` }}>
            <Quote size={22} color={T.gold} style={{ marginBottom: 10 }} />
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, color: T.ink, lineHeight: 1.2 }}>{quote.jp}</div>
            <div style={{ fontSize: 13, color: T.ink3, fontStyle: "italic", margin: "4px 0 10px" }}>{quote.romaji}</div>
            <div style={{ fontSize: 14, color: T.ink2, lineHeight: 1.5 }}>« {quote.fr} »</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- BUDGET ---------- */
