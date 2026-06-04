import React, { useState } from "react";
import { T } from "../constants.js";
import { fmt } from "../lib/helpers.js";
import { Plus } from "./icons.js";
import { Btn } from "./ui/Btn.jsx";

/**
 * Ligne d'assignation d'un hôtel à un jour donné, avec sélecteur ± du nombre
 * de nuits consécutives. Utilisée dans la vue « Par jour ».
 *
 * Props :
 * - stay : l'hôtel à proposer
 * - maxNights : limite supérieure (pour ne pas dépasser la fin du voyage)
 * - onAssign(nbNights) : callback quand l'utilisateur clique "Ajouter"
 */
export function StayAssignRow({ stay, maxNights, onAssign }) {
  const [nights, setNights] = useState(1);
  const cap = Math.max(1, Math.min(maxNights, 14));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: `1px dashed ${T.line}`,
        background: T.paper,
        borderRadius: 10,
        fontFamily: "inherit",
      }}
    >
      <Plus size={14} color={T.matcha} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{stay.name}</div>
        <div style={{ fontSize: 11, color: T.ink3 }}>
          {stay.area} · {fmt(stay.price)} $/nuit
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: T.card,
          padding: 3,
          borderRadius: 8,
          border: `1px solid ${T.line}`,
        }}
      >
        <button
          onClick={() => setNights(Math.max(1, nights - 1))}
          style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", color: T.ink2, fontSize: 16 }}
        >−</button>
        <span style={{ minWidth: 22, textAlign: "center", fontWeight: 700, fontSize: 13 }}>{nights}</span>
        <button
          onClick={() => setNights(Math.min(cap, nights + 1))}
          style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", color: T.ink2, fontSize: 16 }}
        >+</button>
      </div>
      <Btn size="sm" variant="soft" onClick={() => { onAssign(nights); setNights(1); }}>
        {nights > 1 ? `${nights} nuits` : "Ajouter"}
      </Btn>
    </div>
  );
}
