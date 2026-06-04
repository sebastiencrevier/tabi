import { useState } from "react";
import { Check, Gift, Plus, X } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Empty, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { uid } from "../lib/helpers";
import type { AppData } from "../types";

interface SouvenirsProps {
  data: AppData;
  set: (d: AppData) => void;
}

export function Souvenirs({ data, set }: SouvenirsProps) {
  const { souvenirs } = data;
  const [input, setInput] = useState("");
  const [who, setWho] = useState("Moi");

  const add = () => {
    if (!input.trim()) return;
    set({
      ...data,
      souvenirs: [...souvenirs, { id: uid(), text: input.trim(), done: false, who }],
    });
    setInput("");
  };
  const toggle = (id: string) =>
    set({ ...data, souvenirs: souvenirs.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) });
  const del = (id: string) => set({ ...data, souvenirs: souvenirs.filter((s) => s.id !== id) });
  const editText = (s: AppData["souvenirs"][0]) => {
    const newText = prompt("Modifier le souvenir :", s.text);
    if (newText === null) return;
    const newWho = prompt("Pour qui ?", s.who || "");
    if (newWho === null) return;
    set({
      ...data,
      souvenirs: souvenirs.map((x) =>
        x.id === s.id ? { ...x, text: newText.trim() || x.text, who: newWho.trim() } : x
      ),
    });
  };
  const got = souvenirs.filter((s) => s.done).length;

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Shopping"
        title="Wishlist souvenirs"
        sub={`${got}/${souvenirs.length} trouvés`}
      />

      <Card className="p-5 flex gap-2.5 flex-wrap">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="ex : Kimono yukata, manga édition limitée..."
          className="flex-1 min-w-[180px] px-3 py-[10px] rounded-[11px] border border-line text-[14px] outline-none font-sans"
        />
        <input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="Pour qui ?"
          className="w-[130px] px-3 py-[10px] rounded-[11px] border border-line text-[14px] outline-none font-sans"
        />
        <Btn variant="accent" onClick={add}>
          <Plus size={16} /> Ajouter
        </Btn>
      </Card>

      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
      >
        {souvenirs.map((s) => (
          <Card
            key={s.id}
            className="p-4 flex items-center gap-3"
            style={{ opacity: s.done ? 0.6 : 1 }}
            hover
          >
            <button
              onClick={() => toggle(s.id)}
              className="w-6 h-6 rounded-[8px] grid place-items-center cursor-pointer shrink-0"
              style={{
                border: `2px solid ${s.done ? T.gold : T.line}`,
                background: s.done ? T.gold : "transparent",
              }}
            >
              {s.done && <Check size={15} color="#fff" strokeWidth={3} />}
            </button>
            <div onClick={() => editText(s)} className="flex-1 min-w-0 cursor-pointer">
              <div
                className="text-[14px] font-semibold text-ink"
                style={{ textDecoration: s.done ? "line-through" : "none" }}
              >
                {s.text}
              </div>
              <div className="text-[12px] text-ink3">{s.who}</div>
            </div>
            <button
              onClick={() => del(s.id)}
              className="bg-transparent border-none text-ink3 cursor-pointer"
            >
              <X size={16} />
            </button>
          </Card>
        ))}
      </div>
      {souvenirs.length === 0 && <Empty icon={Gift} text="Aucun souvenir dans ta liste." />}
    </div>
  );
}
