// ============================================================
// PAGE — Checklist
// ============================================================

import React, { useState } from "react";
import { Check, Plane, Plus, ShoppingBag, X } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Progress, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { uid } from "../lib/helpers.js";

export function Checklist({ data, set }) {
  const { checklist } = data;
  const [input, setInput] = useState("");
  const [section, setSection] = useState("Avant");
  const sections = ["Avant", "Valise"];

  const add = () => {
    if (!input.trim()) return;
    set({ ...data, checklist: [...checklist, { id: uid(), text: input.trim(), done: false, section }] });
    setInput("");
  };
  const toggle = (id) => set({ ...data, checklist: checklist.map((k) => k.id === id ? { ...k, done: !k.done } : k) });
  const del = (id) => set({ ...data, checklist: checklist.filter((k) => k.id !== id) });
  const editText = (k) => {
    const newText = prompt("Modifier la tâche :", k.text);
    if (newText !== null && newText.trim()) set({ ...data, checklist: checklist.map((x) => x.id === k.id ? { ...x, text: newText.trim() } : x) });
  };

  const done = checklist.filter((k) => k.done).length;

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Préparation" title="Checklist voyage" sub={`${done}/${checklist.length} tâches accomplies`} />

      <Card style={{ padding: 20 }}>
        <Progress value={done} max={checklist.length} color={T.matcha} height={10} />
      </Card>

      <Card style={{ padding: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={section} onChange={(e) => setSection(e.target.value)} style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, background: T.paper, fontSize: 14 }}>
          {sections.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Ajouter une tâche..." style={{ flex: 1, minWidth: 180, padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, fontSize: 14, outline: "none" }} />
        <Btn variant="accent" onClick={add}><Plus size={16} /> Ajouter</Btn>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {sections.map((sec) => {
          const items = checklist.filter((k) => k.section === sec);
          return (
            <Card key={sec} style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 14px", fontFamily: "'Fraunces',serif", fontSize: 18, color: T.ink, display: "flex", alignItems: "center", gap: 8 }}>
                {sec === "Avant" ? <Plane size={18} color={T.vermilion} /> : <ShoppingBag size={18} color={T.indigo} />} {sec === "Avant" ? "Avant le départ" : "Dans la valise"}
              </h3>
              <div style={{ display: "grid", gap: 4 }}>
                {items.map((k) => (
                  <div key={k.id} className="tabi-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 10 }}>
                    <button onClick={() => toggle(k.id)} style={{
                      width: 22, height: 22, borderRadius: 7, border: `2px solid ${k.done ? T.matcha : T.line}`, background: k.done ? T.matcha : "transparent",
                      display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, transition: "all .15s",
                    }}>{k.done && <Check size={14} color="#fff" strokeWidth={3} />}</button>
                    <span onClick={() => editText(k)} style={{ flex: 1, fontSize: 14, color: k.done ? T.ink3 : T.ink, textDecoration: k.done ? "line-through" : "none", cursor: "pointer" }}>{k.text}</span>
                    <button onClick={() => del(k.id)} className="tabi-del" style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer", padding: 2 }}><X size={15} /></button>
                  </div>
                ))}
                {items.length === 0 && <div style={{ fontSize: 13, color: T.ink3, padding: "8px 0" }}>Rien pour l'instant.</div>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- NOTES / JOURNAL ---------- */
