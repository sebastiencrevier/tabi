import React from "react";
import { T } from "../../constants.js";

/**
 * Bouton générique avec 5 variantes : primary, accent, ghost, soft, outline.
 * Animation de hover (légère élévation + brillance).
 */
export function Btn({ children, onClick, variant = "primary", size = "md", style = {}, ...p }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    cursor: "pointer",
    border: "none",
    borderRadius: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all .18s cubic-bezier(.2,.7,.3,1)",
    whiteSpace: "nowrap",
    fontSize: size === "sm" ? 13 : 14,
    padding: size === "sm" ? "7px 12px" : "10px 16px",
  };
  const variants = {
    primary: { background: T.ink, color: "#fff" },
    accent:  { background: T.vermilion, color: "#fff" },
    ghost:   { background: "transparent", color: T.ink2 },
    soft:    { background: T.paper2, color: T.ink },
    outline: { background: T.card, color: T.ink, boxShadow: `inset 0 0 0 1px ${T.line}` },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.filter = "brightness(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.filter = "none";
      }}
      {...p}
    >
      {children}
    </button>
  );
}
