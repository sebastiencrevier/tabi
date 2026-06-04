import React from "react";
import { T } from "../constants.js";
import { ArrowRight } from "./icons.js";

/**
 * Lien externe stylé (ouvre dans un nouvel onglet, sécurisé contre tabnabbing).
 * Auto-normalise les URLs sans https://.
 */
export function ExternalLink({ url, label }) {
  if (!url) return null;
  let href = url.trim();
  if (!/^https?:\/\//i.test(href)) href = "https://" + href;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        fontWeight: 600,
        color: T.indigo,
        textDecoration: "none",
      }}
    >
      <ArrowRight size={13} /> {label || "Voir le site"}
    </a>
  );
}
