// ============================================================
// PAGE — Activities
// ============================================================

import React, { useState } from "react";
import { ExternalLink } from "../components/ExternalLink.jsx";
import { PhotoField } from "../components/PhotoField.jsx";
import { Camera, Clock, Plus, Star, Trash2, Wallet } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Empty, Field, Modal, SectionTitle } from "../components/ui/index.jsx";
import { STATUS, T } from "../constants.js";
import { fmt, uid } from "../lib/helpers.js";

export function Activities({ data, set }) {
  const { activities, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCity, setFilterCity] = useState("Toutes");
  const emptyForm = { cityId: cities[0]?.id || "", title: "", cost: "", hours: "", status: "todo", fav: false, note: "", photo: "", url: "" };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModal(true); };
  const openEdit = (a) => { setEditingId(a.id); setForm({ ...emptyForm, ...a }); setModal(true); };

  const save = () => {
    if (!form.title) return;
    if (editingId) {
      set({ ...data, activities: activities.map((a) => a.id === editingId ? { ...a, ...form, cost: parseFloat(form.cost) || 0, hours: parseFloat(form.hours) || 0 } : a) });
    } else {
      set({ ...data, activities: [...activities, { id: uid(), ...form, cost: parseFloat(form.cost) || 0, hours: parseFloat(form.hours) || 0 }] });
    }
    setModal(false); setEditingId(null); setForm(emptyForm);
  };
  const upd = (id, patch) => set({ ...data, activities: activities.map((a) => a.id === id ? { ...a, ...patch } : a) });
  const del = (id) => set({ ...data, activities: activities.filter((a) => a.id !== id) });
  const cycleStatus = (a) => { const order = ["todo", "reserved", "done"]; upd(a.id, { status: order[(order.indexOf(a.status) + 1) % 3] }); };

  const shown = filterCity === "Toutes" ? activities : activities.filter((a) => a.cityId === filterCity);
  const done = activities.filter((a) => a.status === "done").length;

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="À découvrir" title="Activités & attractions" sub={`${done}/${activities.length} complétées · clique une carte pour la modifier`}
        right={<Btn variant="accent" onClick={openAdd}><Plus size={16} /> Ajouter</Btn>} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Toutes", ...cities.map((c) => c.name)].map((name) => {
          const id = name === "Toutes" ? "Toutes" : cities.find((c) => c.name === name)?.id;
          const active = filterCity === id;
          return (
            <button key={name} onClick={() => setFilterCity(id)} style={{
              padding: "7px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: active ? T.ink : T.card, color: active ? "#fff" : T.ink2, boxShadow: active ? "none" : `inset 0 0 0 1px ${T.line}`,
              transition: "all .15s",
            }}>{name}</button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {shown.map((a) => {
          const city = cities.find((c) => c.id === a.cityId);
          const st = STATUS[a.status];
          return (
            <Card key={a.id} style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} hover onClick={() => openEdit(a)}>
              {a.photo && <img src={a.photo} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />}
              <div style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <button onClick={(e) => { e.stopPropagation(); cycleStatus(a); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, color: st.color, background: st.soft, border: "none", cursor: "pointer" }}>
                  <st.icon size={13} /> {st.label}
                </button>
                <button onClick={(e) => { e.stopPropagation(); upd(a.id, { fav: !a.fav }); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  <Star size={18} fill={a.fav ? T.gold : "none"} stroke={a.fav ? T.gold : T.ink3} />
                </button>
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: T.ink }}>{a.title}</h3>
              <div style={{ fontSize: 12, color: T.ink3, marginBottom: 10 }}>{city?.name} {city?.jp}{a.day ? ` · Jour ${a.day}` : ""}</div>
              {a.note && <p style={{ margin: "0 0 12px", fontSize: 13, color: T.ink2, lineHeight: 1.45, fontStyle: "italic" }}>{a.note}</p>}
              {a.url && <div style={{ marginBottom: 12 }} onClick={(e) => e.stopPropagation()}><ExternalLink url={a.url} label="Site / réservation" /></div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", gap: 12, fontSize: 13, color: T.ink2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Wallet size={13} /> {a.cost ? fmt(a.cost) + " $" : "Gratuit"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {a.hours}h</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer cette activité ?")) del(a.id); }} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer" }}><Trash2 size={15} /></button>
              </div>
              </div>
            </Card>
          );
        })}
      </div>
      {shown.length === 0 && <Empty icon={Camera} text="Aucune activité pour ce filtre." action={<Btn variant="soft" onClick={openAdd}><Plus size={15} /> Ajouter</Btn>} />}

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Modifier l'activité" : "Nouvelle activité"}
        footer={<>{editingId && <Btn variant="ghost" onClick={() => { if (confirm("Supprimer cette activité ?")) { del(editingId); setModal(false); } }} style={{ color: T.vermilion, marginRight: "auto" }}><Trash2 size={14} /> Supprimer</Btn>}<Btn variant="ghost" onClick={() => setModal(false)}>Annuler</Btn><Btn variant="accent" onClick={save}>{editingId ? "Enregistrer" : "Ajouter"}</Btn></>}>
        <Field label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="ex : Mont Fuji 5e station" />
        <Field label="Ville" value={form.cityId} onChange={(v) => setForm({ ...form, cityId: v })} options={cities.map((c) => ({ value: c.id, label: c.name }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Coût ($)" type="number" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} placeholder="0" />
          <Field label="Durée (h)" type="number" value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} placeholder="2" />
          <Field label="Statut" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[{ value: "todo", label: "À faire" }, { value: "reserved", label: "Réservé" }, { value: "done", label: "Complété" }]} />
        </div>
        <Field label="Note personnelle" rows={2} value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Conseil, horaire, astuce..." />
        <Field label="Lien (site, billetterie, réservation)" type="url" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://..." />
        <PhotoField label="Photo" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: T.ink2 }}>
          <input type="checkbox" checked={form.fav} onChange={(e) => setForm({ ...form, fav: e.target.checked })} /> Marquer comme favori
        </label>
      </Modal>
    </div>
  );
}

/* ---------- RESTAURANTS ---------- */
