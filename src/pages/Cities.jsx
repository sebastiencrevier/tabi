// ============================================================
// PAGE — Cities
// ============================================================

import React, { useState } from "react";
import { BedDouble, Camera, Edit3, Plus, Trash2 } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Field, Modal, Pill, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { uid } from "../lib/helpers.js";

export function Cities({ data, set }) {
  const { cities, activities, stays } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { name: "", jp: "", nights: 2, note: "" };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c) => { setEditingId(c.id); setForm({ ...emptyForm, ...c }); setModal(true); };
  const save = () => {
    if (!form.name) return;
    if (editingId) {
      set({ ...data, cities: cities.map((c) => c.id === editingId ? { ...c, ...form, nights: parseInt(form.nights) || 1 } : c) });
    } else {
      set({ ...data, cities: [...cities, { id: uid(), ...form, nights: parseInt(form.nights) || 1, lat: 35 }] });
    }
    setModal(false); setEditingId(null); setForm(emptyForm);
  };
  const del = (id) => set({ ...data, cities: cities.filter((c) => c.id !== id) });
  const setNights = (id, n) => set({ ...data, cities: cities.map((c) => c.id === id ? { ...c, nights: Math.max(1, n) } : c) });

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Destinations" title="Villes" sub="Clique l'en-tête d'une carte pour modifier la ville."
        right={<Btn variant="accent" onClick={openAdd}><Plus size={16} /> Ajouter une ville</Btn>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {cities.map((c, i) => {
          const acts = activities.filter((a) => a.cityId === c.id);
          const hotels = stays.filter((h) => h.cityId === c.id);
          return (
            <Card key={c.id} style={{ padding: 0, overflow: "hidden" }} hover>
              <div onClick={() => openEdit(c)} style={{ height: 88, background: `linear-gradient(135deg, ${i % 2 ? T.indigo : T.vermilion} 0%, ${i % 2 ? "#2C3A4D" : "#A6362F"} 100%)`, position: "relative", padding: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end", cursor: "pointer" }}>
                <div style={{ position: "absolute", right: 14, top: 8, fontSize: 56, fontFamily: "'Fraunces',serif", color: "rgba(255,255,255,.18)", lineHeight: 1 }}>{c.jp}</div>
                <Edit3 size={14} color="rgba(255,255,255,.5)" style={{ position: "absolute", right: 14, bottom: 14 }} />
                <h3 style={{ margin: 0, color: "#fff", fontFamily: "'Fraunces',serif", fontSize: 24 }}>{c.name}</h3>
              </div>
              <div style={{ padding: 18 }}>
                <p onClick={() => openEdit(c)} style={{ margin: "0 0 14px", fontSize: 13, color: T.ink2, lineHeight: 1.5, minHeight: 38, cursor: "pointer" }}>{c.note}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <Pill icon={Camera} color={T.indigo} soft={T.indigoSoft}>{acts.length} act.</Pill>
                  <Pill icon={BedDouble} color={T.matcha} soft={T.matchaSoft}>{hotels.length} héberg.</Pill>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, color: T.ink3 }}>Nuits</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setNights(c.id, c.nights - 1)} style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${T.line}`, background: T.card, cursor: "pointer", color: T.ink2, fontSize: 16, lineHeight: 1 }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: 16, minWidth: 18, textAlign: "center" }}>{c.nights}</span>
                    <button onClick={() => setNights(c.id, c.nights + 1)} style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${T.line}`, background: T.card, cursor: "pointer", color: T.ink2, fontSize: 16, lineHeight: 1 }}>+</button>
                    <button onClick={() => { if (confirm("Supprimer cette ville ?")) del(c.id); }} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer", marginLeft: 4 }}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Modifier la ville" : "Nouvelle ville"}
        footer={<>{editingId && <Btn variant="ghost" onClick={() => { if (confirm("Supprimer cette ville ?")) { del(editingId); setModal(false); } }} style={{ color: T.vermilion, marginRight: "auto" }}><Trash2 size={14} /> Supprimer</Btn>}<Btn variant="ghost" onClick={() => setModal(false)}>Annuler</Btn><Btn variant="accent" onClick={save}>{editingId ? "Enregistrer" : "Ajouter"}</Btn></>}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="ex : Sapporo" />
          <Field label="Kanji (optionnel)" value={form.jp} onChange={(v) => setForm({ ...form, jp: v })} placeholder="札幌" />
        </div>
        <Field label="Nuits" type="number" value={form.nights} onChange={(v) => setForm({ ...form, nights: v })} />
        <Field label="Note" rows={2} value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Pourquoi cette ville ?" />
      </Modal>
    </div>
  );
}

/* ---------- ACTIVITÉS ---------- */
