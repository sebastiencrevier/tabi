import { useState } from "react";
import { Check, Plane, Plus, ShoppingBag, X } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Progress, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { uid } from "../lib/helpers";
import type { AppData } from "../types";

interface ChecklistProps {
  data: AppData;
  set: (d: AppData) => void;
}

export function Checklist({ data, set }: ChecklistProps) {
  const { checklist } = data;
  const [input, setInput] = useState("");
  const [section, setSection] = useState("Avant");
  const sections = ["Avant", "Valise"];

  const add = () => {
    if (!input.trim()) return;
    set({
      ...data,
      checklist: [...checklist, { id: uid(), text: input.trim(), done: false, section }],
    });
    setInput("");
  };
  const toggle = (id: string) =>
    set({ ...data, checklist: checklist.map((k) => (k.id === id ? { ...k, done: !k.done } : k)) });
  const del = (id: string) => set({ ...data, checklist: checklist.filter((k) => k.id !== id) });
  const editText = (k: AppData["checklist"][0]) => {
    const newText = prompt("Modifier la tâche :", k.text);
    if (newText !== null && newText.trim())
      set({
        ...data,
        checklist: checklist.map((x) => (x.id === k.id ? { ...x, text: newText.trim() } : x)),
      });
  };

  const done = checklist.filter((k) => k.done).length;

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Préparation"
        title="Checklist voyage"
        sub={`${done}/${checklist.length} tâches accomplies`}
      />

      <Card className="p-5">
        <Progress value={done} max={checklist.length} color={T.matcha} height={10} />
      </Card>

      <Card className="p-5 flex gap-2.5 flex-wrap items-center">
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="px-3 py-[10px] rounded-[11px] border border-line text-[14px] font-sans"
          style={{ background: T.paper }}
        >
          {sections.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Ajouter une tâche..."
          className="flex-1 min-w-[180px] px-3 py-[10px] rounded-[11px] border border-line text-[14px] outline-none font-sans"
        />
        <Btn variant="accent" onClick={add}>
          <Plus size={16} /> Ajouter
        </Btn>
      </Card>

      <div
        className="grid gap-[18px]"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {sections.map((sec) => {
          const items = checklist.filter((k) => k.section === sec);
          return (
            <Card key={sec} className="p-[22px]">
              <h3 className="m-0 mb-3.5 font-serif text-[18px] text-ink flex items-center gap-2">
                {sec === "Avant" ? (
                  <Plane size={18} color={T.vermilion} />
                ) : (
                  <ShoppingBag size={18} color={T.indigo} />
                )}
                {sec === "Avant" ? "Avant le départ" : "Dans la valise"}
              </h3>
              <div className="grid gap-1">
                {items.map((k) => (
                  <div
                    key={k.id}
                    className="tabi-row flex items-center gap-3 px-2 py-[10px] rounded-[10px]"
                  >
                    <button
                      onClick={() => toggle(k.id)}
                      className="w-[22px] h-[22px] rounded-[7px] grid place-items-center cursor-pointer shrink-0 transition-all"
                      style={{
                        border: `2px solid ${k.done ? T.matcha : T.line}`,
                        background: k.done ? T.matcha : "transparent",
                      }}
                    >
                      {k.done && <Check size={14} color="#fff" strokeWidth={3} />}
                    </button>
                    <span
                      onClick={() => editText(k)}
                      className="flex-1 text-[14px] cursor-pointer"
                      style={{
                        color: k.done ? T.ink3 : T.ink,
                        textDecoration: k.done ? "line-through" : "none",
                      }}
                    >
                      {k.text}
                    </span>
                    <button
                      onClick={() => del(k.id)}
                      className="tabi-del bg-transparent border-none text-ink3 cursor-pointer p-0.5"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-[13px] text-ink3 py-2">Rien pour l'instant.</div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
