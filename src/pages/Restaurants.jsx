// ============================================================
// PAGE — Restaurants
// ============================================================

import React, { useState } from "react";
import { ExternalLink } from "../components/ExternalLink.jsx";
import { PhotoField } from "../components/PhotoField.jsx";
import { Heart, MapPin, Plus, Trash2, UtensilsCrossed } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Empty, Field, Modal, Pill, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { fmt, uid } from "../lib/helpers.js";

export function Restaurants({ data, set }) {
  const { restaurants, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { cityId: cities[0]?.id || "", name: "", cuisine: "", budget: "Moyen", avg: "", note: "", fav: false, photo: "", url: "" };
  const [form, setForm] = useState(emptyForm);
  const BUDGETS = { "Économique": T.matcha, "Moyen": T.gold, "Haut de gamme": T.vermilion };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModal(true); };
  const openEdit = (r) => { setEditingId(r.id); setForm({ ...emptyForm, ...r }); setModal(true); };
  const save = () => {
    if (!form.name) return;
    if (editingId) {
      set({ ...data, restaurants: restaurants.map((r) => r.id === editingId ? { ...r, ...form, avg: parseFloat(form.avg) || 0 } : r) });
    } else {
      set({ ...data, restaurants: [...restaurants, { id: uid(), ...form, avg: parseFloat(form.avg) || 0 }] });
    }
    setModal(false); setEditingId(null); setForm(emptyForm);
  };
  const upd = (id, patch) => set({ ...data, restaurants: restaurants.map((r) => r.id === id ? { ...r, ...patch } : r) });
  const del = (id) => set({ ...data, restaurants: restaurants.filter((r) => r.id !== id) });

  const favs = restaurants.filter((r) => r.fav);

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Gastronomie" title="Restaurants" sub={`${restaurants.length} adresses · clique une carte pour la modifier`}
        right={<Btn variant="accent" onClick={openAdd}><Plus size={16} /> Ajouter</Btn>} />

      {favs.length > 0 && (
        <Card style={{ padding: 20, background: `linear-gradient(160deg, ${T.card}, ${T.vermSoft})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Heart size={17} fill={T.vermilion} stroke={T.vermilion} />
            <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 17, color: T.ink }}>Wishlist foodie</h3>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {favs.map((r) => <Pill key={r.id} color={T.vermilion} soft="#fff" style={{ boxShadow: T.shadowSm }}>{r.name}</Pill>)}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {restaurants.map((r) => {
          const city = cities.find((c) => c.id === r.cityId);
          return (
            <Card key={r.id} style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} hover onClick={() => openEdit(r)}>
              {r.photo && <img src={r.photo} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />}
              <div style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 700, color: T.ink }}>{r.name}</h3>
                  <div style={{ fontSize: 12, color: T.ink3 }}><MapPin size={11} style={{ display: "inline", marginRight: 3 }} />{city?.name} · {r.cuisine}{r.day ? ` · Jour ${r.day}` : ""}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); upd(r.id, { fav: !r.fav }); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Heart size={18} fill={r.fav ? T.vermilion : "none"} stroke={r.fav ? T.vermilion : T.ink3} />
                </button>
              </div>
              {r.note && <p style={{ margin: "10px 0", fontSize: 13, color: T.ink2, fontStyle: "italic", lineHeight: 1.45 }}>{r.note}</p>}
              {r.url && <div style={{ margin: "10px 0" }} onClick={(e) => e.stopPropagation()}><ExternalLink url={r.url} label="Site / réservation" /></div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 4, borderTop: `1px solid ${T.line}` }}>
                <Pill color={BUDGETS[r.budget]} soft={BUDGETS[r.budget] + "1A"}>{r.budget}</Pill>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>~{fmt(r.avg)} $</span>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer ce restaurant ?")) del(r.id); }} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer" }}><Trash2 size={15} /></button>
                </div>
              </div>
              </div>
            </Card>
          );
        })}
      </div>
      {restaurants.length === 0 && <Empty icon={UtensilsCrossed} text="Aucun restaurant enregistré." action={<Btn variant="soft" onClick={openAdd}><Plus size={15} /> Ajouter</Btn>} />}

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Modifier le restaurant" : "Nouveau restaurant"}
        footer={<>{editingId && <Btn variant="ghost" onClick={() => { if (confirm("Supprimer ce restaurant ?")) { del(editingId); setModal(false); } }} style={{ color: T.vermilion, marginRight: "auto" }}><Trash2 size={14} /> Supprimer</Btn>}<Btn variant="ghost" onClick={() => setModal(false)}>Annuler</Btn><Btn variant="accent" onClick={save}>{editingId ? "Enregistrer" : "Ajouter"}</Btn></>}>
        <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="ex : Afuri Ramen" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Ville" value={form.cityId} onChange={(v) => setForm({ ...form, cityId: v })} options={cities.map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Cuisine" value={form.cuisine} onChange={(v) => setForm({ ...form, cuisine: v })} placeholder="ex : Ramen yuzu" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Gamme de prix" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} options={["Économique", "Moyen", "Haut de gamme"]} />
          <Field label="Prix moyen ($)" type="number" value={form.avg} onChange={(v) => setForm({ ...form, avg: v })} placeholder="0" />
        </div>
        <Field label="Note personnelle" rows={2} value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Plat à essayer, conseil de réservation..." />
        <Field label="Lien (site, menu, réservation)" type="url" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://..." />
        <PhotoField label="Photo" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: T.ink2 }}>
          <input type="checkbox" checked={form.fav} onChange={(e) => setForm({ ...form, fav: e.target.checked })} /> Ajouter à la wishlist foodie
        </label>
      </Modal>
    </div>
  );
}

/* ---------- HÉBERGEMENTS ---------- */
