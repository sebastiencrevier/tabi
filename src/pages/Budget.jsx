// ============================================================
// PAGE — Budget
// ============================================================

import React, { useMemo, useState } from "react";
import { AlertTriangle, Check, Edit3, Plus, Trash2, TrendingUp, Users, Wallet } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Donut, Empty, Field, Modal, Pill, Progress, SectionTitle } from "../components/ui/index.jsx";
import { CATS, PEOPLE, T } from "../constants.js";
import { fmt, uid } from "../lib/helpers.js";

export function Budget({ data, set, totalSpent }) {
  const { trip, expenses, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(trip.budget);
  const emptyForm = { cat: "Activités", label: "", amount: "", date: new Date().toISOString().slice(0, 10), paidBy: PEOPLE[0], split: false };
  const [form, setForm] = useState(emptyForm);

  const remaining = trip.budget - totalSpent;
  const over = remaining < 0;
  const byCat = Object.keys(CATS).map((cat) => ({
    cat, value: expenses.filter((e) => e.cat === cat).reduce((s, e) => s + e.amount, 0),
    color: CATS[cat].color,
  })).filter((x) => x.value > 0);

  /* ----- Calcul du partage façon Splitwise -----
     - Dépense perso (split=false) : 100% à la charge du payeur.
     - Dépense partagée (split=true) : 50/50 entre Filou et Kathou. */
  const tally = useMemo(() => {
    const paid = { "Filou": 0, "Kathou": 0 };
    const owed = { "Filou": 0, "Kathou": 0 };
    expenses.forEach((e) => {
      const payer = PEOPLE.includes(e.paidBy) ? e.paidBy : PEOPLE[0];
      paid[payer] += e.amount;
      if (e.split) { owed["Filou"] += e.amount / 2; owed["Kathou"] += e.amount / 2; }
      else { owed[payer] += e.amount; }
    });
    const balFilou = paid["Filou"] - owed["Filou"];
    let settle = null;
    const amt = Math.abs(balFilou);
    if (amt >= 0.5) settle = balFilou > 0 ? { from: "Kathou", to: "Filou", amount: amt } : { from: "Filou", to: "Kathou", amount: amt };
    return { paid, owed, settle };
  }, [expenses]);

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm, paidBy: form.paidBy }); setModal(true); };
  const openEdit = (e) => { setEditingId(e.id); setForm({ ...emptyForm, ...e, amount: String(e.amount), split: !!e.split }); setModal(true); };
  const save = () => {
    if (!form.label || !form.amount) return;
    if (editingId) {
      set({ ...data, expenses: expenses.map((e) => e.id === editingId ? { ...e, ...form, amount: parseFloat(form.amount) } : e) });
    } else {
      set({ ...data, expenses: [{ id: uid(), ...form, amount: parseFloat(form.amount) }, ...expenses] });
    }
    setModal(false); setEditingId(null);
  };
  const del = (id) => set({ ...data, expenses: expenses.filter((e) => e.id !== id) });
  const saveBudget = () => { set({ ...data, trip: { ...trip, budget: parseFloat(budgetInput) || 0 } }); setEditBudget(false); };

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Finances" title="Budget" sub="Suis tes dépenses, par catégorie et par personne."
        right={<Btn variant="accent" onClick={openAdd}><Plus size={16} /> Ajouter une dépense</Btn>} />

      {over && (
        <Card style={{ padding: "14px 18px", background: T.vermSoft, border: `1px solid ${T.vermilion}33`, display: "flex", gap: 12, alignItems: "center" }}>
          <AlertTriangle size={20} color={T.vermilion} />
          <div style={{ color: T.vermilion, fontWeight: 600, fontSize: 14 }}>Tu dépasses ton budget de {fmt(Math.abs(remaining))} $. Ajuste tes dépenses ou augmente le budget.</div>
        </Card>
      )}

      {/* ----- BANDEAU BALANCE PROÉMINENT ----- */}
      <Card style={{ padding: 0, overflow: "hidden", background: tally.settle ? `linear-gradient(135deg, ${PERSON_COLOR[tally.settle.to]} 0%, ${PERSON_COLOR[tally.settle.to]}E6 100%)` : `linear-gradient(135deg, ${T.matcha} 0%, #5A6B4D 100%)`, color: "#fff" }}>
        <div style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <TrendingUp size={26} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85, marginBottom: 4 }}>Balance actuelle</div>
            {tally.settle ? (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, lineHeight: 1.15 }}>
                  {tally.settle.from} doit <span style={{ fontSize: 32 }}>{fmt(tally.settle.amount)} $</span> à {tally.settle.to}
                </div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                  pour équilibrer les dépenses du voyage
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 600 }}>Tout est équilibré ✨</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Filou et Kathou sont à zéro l'un envers l'autre.</div>
              </>
            )}
          </div>
        </div>
        {/* Détail par personne en bas */}
        <div style={{ background: "rgba(0,0,0,.18)", padding: "12px 24px", display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13 }}>
          {PEOPLE.map((p) => {
            const net = tally.paid[p] - tally.owed[p];
            const sign = net > 0.5 ? "+" : net < -0.5 ? "−" : "";
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "#fff", opacity: 0.85 }} />
                <span style={{ opacity: 0.85 }}>{p} a payé <strong>{fmt(tally.paid[p])} $</strong></span>
                {Math.abs(net) >= 0.5 && (
                  <span style={{ opacity: 0.7, fontSize: 12 }}>({sign}{fmt(Math.abs(net))} $)</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ----- RÉCAP PARTAGE (détail Splitwise) ----- */}
      <Card style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Users size={18} color={T.indigo} />
          <h3 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink }}>Détail du partage</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="tabi-cardgrid">
          {PEOPLE.map((p) => (
            <div key={p} style={{ padding: 16, borderRadius: 14, background: T.paper, border: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 99, background: PERSON_COLOR[p], color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>{p[0]}</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{p}</span>
              </div>
              <div style={{ fontSize: 12, color: T.ink3 }}>A payé</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{fmt(tally.paid[p])} $</div>
              <div style={{ fontSize: 12, color: T.ink3, marginTop: 8 }}>Sa part réelle : {fmt(tally.owed[p])} $</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 14, lineHeight: 1.5 }}>
          Par défaut chaque dépense est <strong>personnelle</strong> (100 % au payeur). Coche « Partager 50/50 » à l'ajout pour les dépenses communes (train, hôtel partagé…).
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 22 }} className="tabi-2col">
        {/* Donut + résumé */}
        <Card style={{ padding: 28, display: "grid", gap: 20, justifyItems: "center" }}>
          <Donut size={190} stroke={22} segments={byCat.length ? byCat : [{ value: 1, color: T.paper2 }]}
            center={<div><div style={{ fontSize: 11, color: T.ink3, fontWeight: 600, textTransform: "uppercase" }}>Dépensé</div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fraunces',serif", color: over ? T.vermilion : T.ink }}>{fmt(totalSpent)}$</div></div>} />
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: T.ink2 }}>Budget {editBudget ? "" : fmt(trip.budget) + " $"}</span>
              {!editBudget && <button onClick={() => { setBudgetInput(trip.budget); setEditBudget(true); }} style={{ background: "none", border: "none", color: T.vermilion, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Edit3 size={12} /> Modifier</button>}
            </div>
            {editBudget ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.line}`, fontSize: 14 }} />
                <Btn size="sm" onClick={saveBudget}><Check size={14} /></Btn>
              </div>
            ) : (
              <>
                <Progress value={totalSpent} max={trip.budget} color={over ? T.vermilion : T.matcha} height={10} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13 }}>
                  <span style={{ color: T.ink2 }}>Restant</span>
                  <span style={{ fontWeight: 700, color: over ? T.vermilion : T.matcha }}>{fmt(remaining)} $</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Par catégorie */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink }}>Dépenses par catégorie</h3>
          <div style={{ display: "grid", gap: 14 }}>
            {Object.keys(CATS).map((cat) => {
              const v = expenses.filter((e) => e.cat === cat).reduce((s, e) => s + e.amount, 0);
              const C = CATS[cat];
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Pill color={C.color} soft={C.soft} icon={C.icon}>{cat}</Pill>
                    <span style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{fmt(v)} $</span>
                  </div>
                  <Progress value={v} max={Math.max(...Object.keys(CATS).map((c) => expenses.filter((e) => e.cat === c).reduce((s, e) => s + e.amount, 0)), 1)} color={C.color} height={6} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Liste dépenses */}
      <Card style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink }}>Historique ({expenses.length})</h3>
        {expenses.length === 0 ? <Empty icon={Wallet} text="Aucune dépense enregistrée." /> : (
          <div style={{ display: "grid", gap: 8 }}>
            {expenses.map((e) => {
              const C = CATS[e.cat] || CATS["Autres"];
              const payer = PEOPLE.includes(e.paidBy) ? e.paidBy : PEOPLE[0];
              return (
                <div key={e.id} className="tabi-row" onClick={() => openEdit(e)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: T.paper, borderRadius: 12, cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.soft, display: "grid", placeItems: "center", color: C.color, flexShrink: 0 }}>
                    <C.icon size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{e.label}</div>
                    <div style={{ fontSize: 12, color: T.ink3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span>{e.cat} · {new Date(e.date).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 8px", borderRadius: 99, background: "#fff", border: `1px solid ${T.line}` }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: PERSON_COLOR[payer] }} /> {payer}{e.split ? " · partagé" : ""}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{fmt(e.amount)} $</span>
                  <button onClick={(ev) => { ev.stopPropagation(); if (confirm("Supprimer cette dépense ?")) del(e.id); }} className="tabi-del" style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer", padding: 4 }}><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Modifier la dépense" : "Nouvelle dépense"}
        footer={<>{editingId && <Btn variant="ghost" onClick={() => { if (confirm("Supprimer cette dépense ?")) { del(editingId); setModal(false); } }} style={{ color: T.vermilion, marginRight: "auto" }}><Trash2 size={14} /> Supprimer</Btn>}<Btn variant="ghost" onClick={() => setModal(false)}>Annuler</Btn><Btn variant="accent" onClick={save}>{editingId ? "Enregistrer" : "Ajouter"}</Btn></>}>
        <Field label="Description" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="ex : Billet Shinkansen Tokyo-Kyoto" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Montant ($)" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="0" />
          <Field label="Catégorie" value={form.cat} onChange={(v) => setForm({ ...form, cat: v })} options={Object.keys(CATS)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Payé par" value={form.paidBy} onChange={(v) => setForm({ ...form, paidBy: v })} options={PEOPLE} />
          <Field label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: T.ink2, padding: "4px 0" }}>
          <input type="checkbox" checked={form.split} onChange={(e) => setForm({ ...form, split: e.target.checked })} />
          Partager 50/50 entre Filou et Kathou (sinon : 100 % pour {form.paidBy})
        </label>
      </Modal>
    </div>
  );
}

/* ---------- ITINÉRAIRE (drag & drop) ---------- */
