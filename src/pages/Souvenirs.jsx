// ============================================================
// PAGE — Souvenirs
// ============================================================

import React, { useState } from "react";
import { Check, Gift, Plus, X } from "../components/icons.js";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Empty, SectionTitle } from "../components/ui/index.jsx";
import { T } from "../constants.js";
import { uid } from "../lib/helpers.js";

export function Souvenirs({ data, set }) {
  const { souvenirs } = data;
  const [input, setInput] = useState("");
  const [who, setWho] = useState("Moi");

  const add = () => {
    if (!input.trim()) return;
    set({ ...data, souvenirs: [...souvenirs, { id: uid(), text: input.trim(), done: false, who }] });
    setInput("");
  };
  const toggle = (id) => set({ ...data, souvenirs: souvenirs.map((s) => s.id === id ? { ...s, done: !s.done } : s) });
  const del = (id) => set({ ...data, souvenirs: souvenirs.filter((s) => s.id !== id) });
  const editText = (s) => {
    const newText = prompt("Modifier le souvenir :", s.text);
    if (newText === null) return;
    const newWho = prompt("Pour qui ?", s.who || "");
    if (newWho === null) return;
    set({ ...data, souvenirs: souvenirs.map((x) => x.id === s.id ? { ...x, text: newText.trim() || x.text, who: newWho.trim() } : x) });
  };
  const got = souvenirs.filter((s) => s.done).length;

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <SectionTitle kicker="Shopping" title="Wishlist souvenirs" sub={`${got}/${souvenirs.length} trouvés`} />

      <Card style={{ padding: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="ex : Kimono yukata, manga édition limitée..." style={{ flex: 1, minWidth: 180, padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, fontSize: 14, outline: "none" }} />
        <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Pour qui ?" style={{ width: 130, padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, fontSize: 14, outline: "none" }} />
        <Btn variant="accent" onClick={add}><Plus size={16} /> Ajouter</Btn>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {souvenirs.map((s) => (
          <Card key={s.id} style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, opacity: s.done ? 0.6 : 1 }} hover>
            <button onClick={() => toggle(s.id)} style={{
              width: 24, height: 24, borderRadius: 8, border: `2px solid ${s.done ? T.gold : T.line}`, background: s.done ? T.gold : "transparent",
              display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
            }}>{s.done && <Check size={15} color="#fff" strokeWidth={3} />}</button>
            <div onClick={() => editText(s)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, textDecoration: s.done ? "line-through" : "none" }}>{s.text}</div>
              <div style={{ fontSize: 12, color: T.ink3 }}>{s.who}</div>
            </div>
            <button onClick={() => del(s.id)} style={{ background: "none", border: "none", color: T.ink3, cursor: "pointer" }}><X size={16} /></button>
          </Card>
        ))}
      </div>
      {souvenirs.length === 0 && <Empty icon={Gift} text="Aucun souvenir dans ta liste." />}
    </div>
  );
}


/* ============================================================
   APP — navigation + orchestration
   ============================================================ */
