// ============================================================
// PAGE — Stays
// ============================================================

import React, { useState } from "react";
import { ExternalLink } from "../components/ExternalLink.jsx";
import { PhotoField } from "../components/PhotoField.jsx";
import { BedDouble, Plus, Star, Trash2 } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Empty, Field, Modal, Pill, SectionTitle } from "../components/ui/index.jsx";
import { STATUS, T } from "../constants.js";
import { fmt, uid } from "../lib/helpers.js";

export function Stays({ data, set }) {
  const { stays, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { cityId: cities[0]?.id || "", name: "", area: "", price: "", dist: "", rating: "", status: "todo", note: "", photo: "", url: "" };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModal(true); };
  const openEdit = (h) => { setEditingId(h.id); setForm({ ...emptyForm, ...h }); setModal(true); };
  const save = () => {
    if (!form.name) return;
    if (editingId) {
      set({ ...data, stays: stays.map((h) => h.id === editingId ? { ...h, ...form, price: parseFloat(form.price) || 0, rating: parseFloat(form.rating) || 0 } : h) });
    } else {
      set({ ...data, stays: [...stays, { id: uid(), ...form, price: parseFloat(form.price) || 0, rating: parseFloat(form.rating) || 0 }] });
    }
    setModal(false); setEditingId(null); setForm(emptyForm);
  };
  const upd = (id, patch) => set({ ...data, stays: stays.map((h) => h.id === id ? { ...h, ...patch } : h) });
  const del = (id) => set({ ...data, stays: stays.filter((h) => h.id !== id) });

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Où dormir" title="Hébergements" sub="Clique une ligne pour modifier l'hébergement."
        right={<Btn variant="accent" onClick={openAdd}><Plus size={16} /> Ajouter</Btn>} />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="tabi-table">
          <div className="tabi-thead" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr 40px", gap: 12, padding: "14px 20px", background: T.paper2, fontSize: 12, fontWeight: 700, color: T.ink2, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span>Hébergement</span><span>Quartier</span><span>Distance</span><span>Note</span><span>Statut</span><span></span>
          </div>
          {stays.map((h) => {
            const city = cities.find((c) => c.id === h.cityId);
            const st = STATUS[h.status];
            return (
              <div key={h.id} className="tabi-trow" onClick={() => openEdit(h)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr 40px", gap: 12, padding: "16px 20px", borderTop: `1px solid ${T.line}`, alignItems: "center", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {h.photo && <img src={h.photo} alt="" style={{ width: 44, height: 44, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: T.ink3 }}>
                      {city?.name} · {fmt(h.price)} $/nuit{h.note ? ` — ${h.note}` : ""}
                      {(() => {
                        const ds = Array.isArray(h.days) ? h.days : (h.day ? [h.day] : []);
                        if (ds.length === 0) return null;
                        const sorted = [...ds].sort((a, b) => a - b);
                        const label = sorted.length === 1 ? `Jour ${sorted[0]}` : `${sorted.length} nuits (J${sorted[0]}–J${sorted[sorted.length - 1]})`;
                        return <span style={{ marginLeft: 6, padding: "1px 7px", borderRadius: 99, background: T.matchaSoft, color: T.matcha, fontWeight: 600, fontSize: 11 }}>📅 {label}</span>;
                      })()}
                    </div>
                    {h.url && <div style={{ marginTop: 3 }} onClick={(e) => e.stopPropagation()}><ExternalLink url={h.url} label="Réserver / voir" /></div>}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: T.ink2 }}>{h.area}</span>
                <span style={{ fontSize: 13, color: T.ink2 }}>{h.dist}</span>
                <span><Pill color={T.gold} soft={T.goldSoft} icon={Star}>{h.rating}</Pill></span>
                <button onClick={(e) => { e.stopPropagation(); upd(h.id, { status: ["todo", "reserved", "done"][(["todo", "reserved", "done"].indexOf(h.status) + 1) % 3] }); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, color: st.color, background: st.soft, border: "none", cursor: "pointer", width: "fit-content" }}>
                  <st.icon size={12} /> {st.label}
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer cet hébergement ?")) del(h.id); }} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer" }}><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
        {stays.length === 0 && <Empty icon={BedDouble} text="Aucun hébergement enregistré." />}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Modifier l'hébergement" : "Nouvel hébergement"}
        footer={<>{editingId && <Btn variant="ghost" onClick={() => { if (confirm("Supprimer cet hébergement ?")) { del(editingId); setModal(false); } }} style={{ color: T.vermilion, marginRight: "auto" }}><Trash2 size={14} /> Supprimer</Btn>}<Btn variant="ghost" onClick={() => setModal(false)}>Annuler</Btn><Btn variant="accent" onClick={save}>{editingId ? "Enregistrer" : "Ajouter"}</Btn></>}>
        <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="ex : The Tokyo Station Hotel" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Ville" value={form.cityId} onChange={(v) => setForm({ ...form, cityId: v })} options={cities.map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Quartier" value={form.area} onChange={(v) => setForm({ ...form, area: v })} placeholder="ex : Marunouchi" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Prix/nuit ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="0" />
          <Field label="Note /10" type="number" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} placeholder="9.0" />
          <Field label="Statut" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[{ value: "todo", label: "À faire" }, { value: "reserved", label: "Réservé" }, { value: "done", label: "Confirmé" }]} />
        </div>
        <Field label="Distance des attractions" value={form.dist} onChange={(v) => setForm({ ...form, dist: v })} placeholder="ex : 5 min à pied de la gare" />
        <Field label="Note personnelle" value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Petit-déj inclus, vue..." />
        <Field label="Lien (réservation, Booking, site)" type="url" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://..." />
        {/* Sélecteur de nuits — éditable comme texte ("3-7" ou "3,4,5") */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>Nuits assignées (numéros de jours)</div>
          <input
            type="text"
            value={(() => {
              const ds = Array.isArray(form.days) ? form.days : (form.day ? [form.day] : []);
              if (!ds.length) return "";
              const sorted = [...ds].sort((a, b) => a - b);
              // Compresse en ranges si consécutifs
              const ranges = [];
              let i = 0;
              while (i < sorted.length) {
                let j = i;
                while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
                ranges.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
                i = j + 1;
              }
              return ranges.join(", ");
            })()}
            onChange={(e) => {
              const txt = e.target.value;
              // Parse "3-5, 7, 9-10" → [3,4,5,7,9,10]
              const days = [];
              txt.split(",").forEach((part) => {
                const p = part.trim();
                if (!p) return;
                const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
                if (m) {
                  const a = parseInt(m[1]), b = parseInt(m[2]);
                  for (let k = Math.min(a, b); k <= Math.max(a, b); k++) days.push(k);
                } else {
                  const n = parseInt(p);
                  if (!isNaN(n) && n > 0) days.push(n);
                }
              });
              setForm({ ...form, days: [...new Set(days)].sort((a, b) => a - b), day: undefined });
            }}
            placeholder="ex : 3-7 (du jour 3 au jour 7) ou 1, 4, 9"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, background: T.paper, fontSize: 14, color: T.ink, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ fontSize: 11, color: T.ink3, marginTop: 4, lineHeight: 1.4 }}>Tu peux aussi assigner les nuits directement depuis l'onglet « Par jour » avec le bouton « + Ajouter ».</div>
        </div>
        <PhotoField label="Photo" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
      </Modal>
    </div>
  );
}

/* ---------- CHECKLIST ---------- */
