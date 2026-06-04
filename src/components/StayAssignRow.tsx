import { useState } from "react";
import { T } from "../constants";
import { fmt } from "../lib/helpers";
import { Plus } from "./icons";
import { Btn } from "./ui/Btn";
import type { Stay } from "../types";

interface StayAssignRowProps {
  stay: Stay;
  maxNights: number;
  onAssign: (nights: number) => void;
}

export function StayAssignRow({ stay, maxNights, onAssign }: StayAssignRowProps) {
  const [nights, setNights] = useState(1);
  const cap = Math.max(1, Math.min(maxNights, 14));
  return (
    <div
      className="flex items-center gap-2 p-[10px] rounded-[10px] font-sans"
      style={{ border: `1px dashed ${T.line}`, background: T.paper }}
    >
      <Plus size={14} color={T.matcha} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink font-semibold">{stay.name}</div>
        <div className="text-[11px] text-ink3">
          {stay.area} · {fmt(stay.price)} $/nuit
        </div>
      </div>
      <div className="flex items-center gap-1 p-[3px] rounded-lg border border-line bg-card">
        <button
          onClick={() => setNights(Math.max(1, nights - 1))}
          className="w-6 h-6 border-none bg-transparent cursor-pointer text-ink2 text-base"
        >
          −
        </button>
        <span className="min-w-[22px] text-center font-bold text-[13px]">{nights}</span>
        <button
          onClick={() => setNights(Math.min(cap, nights + 1))}
          className="w-6 h-6 border-none bg-transparent cursor-pointer text-ink2 text-base"
        >
          +
        </button>
      </div>
      <Btn
        size="sm"
        variant="soft"
        onClick={() => {
          onAssign(nights);
          setNights(1);
        }}
      >
        {nights > 1 ? `${nights} nuits` : "Ajouter"}
      </Btn>
    </div>
  );
}
