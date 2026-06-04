// ============================================================
// PAGE — Notes
// ============================================================

import React, { useState } from "react";
import { NotebookPen, Plus, Trash2 } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Empty, Field, Modal, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { uid } from "../lib/helpers.js";

export function Notes({ data, set }) {
  const { notes } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { title: "", date: "", body: "" };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModal(true); };
  const openEdit = (n) => { setEditingId(n.id); setForm({ ...emptyForm, ...n }); setModal(true); };
  const save = () => {
    if (!form.title && !form.body) return;
    if (editingId) {
      set({ ...data, notes: notes.map((n) => n.id === editingId ? { ...n, ...form } : n) });
    } else {
      set({ ...data, notes: [{ id: uid(), ...form }, ...notes] });
    }
    setModal(false); setEditingId(null); setForm(emptyForm);
  };
  const del = (id) => set({ ...data, notes: notes.filter((n) => n.id !== id) });

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Carnet" title="Notes & journal" sub="Clique une note pour la modifier."
        right={<Btn variant="accent" onClick={openAdd}><Plus size={16} /> Nouvelle entrée</Btn>} />

      <div style={{ columnWidth: 320, columnGap: 18 }}>
        {notes.map((n) => (
          <Card key={n.id} style={{ padding: 22, marginBottom: 18, breakInside: "avoid", display: "inline-block", width: "100%", cursor: "pointer" }} hover onClick={() => openEdit(n)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                {n.title && <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink }}>{n.title}</h3>}
                {n.date && <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{new Date(n.date).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}</div>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer cette note ?")) del(n.id); }} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer" }}><Trash2 size={15} /></button>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: T.ink2, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n.body}</p>
          </Card>
        ))}
      </div>
      {notes.length === 0 && <Empty icon={NotebookPen} text="Ton carnet est vide." action={<Btn variant="soft" onClick={openAdd}><Plus size={15} /> Écrire</Btn>} />}

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Modifier l'entrée" : "Nouvelle entrée"}
        footer={<>{editingId && <Btn variant="ghost" onClick={() => { if (confirm("Supprimer cette note ?")) { del(editingId); setModal(false); } }} style={{ color: T.vermilion, marginRight: "auto" }}><Trash2 size={14} /> Supprimer</Btn>}<Btn variant="ghost" onClick={() => setModal(false)}>Annuler</Btn><Btn variant="accent" onClick={save}>{editingId ? "Enregistrer" : "Ajouter"}</Btn></>}>
        <Field label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="ex : Premier jour à Tokyo" />
        <Field label="Date (optionnel)" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        <Field label="Texte" rows={6} value={form.body} onChange={(v) => setForm({ ...form, body: v })} placeholder="Raconte..." />
      </Modal>
    </div>
  );
}

/* ---------- Ligne d'assignation d'un hôtel (avec sélecteur de nuits) ---------- */
