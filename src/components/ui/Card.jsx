import React from "react";
import { T } from "../../constants.js";

/**
 * Carte blanche avec ombre douce. Si `hover` est vrai, légère élévation au survol.
 */
export function Card({ children, style = {}, hover = false, ...p }) {
  return (
    <div
      {...p}
      style={{
        background: T.card,
        borderRadius: 18,
        boxShadow: T.shadowMd,
        border: `1px solid ${T.line}`,
        transition: "all .22s cubic-bezier(.2,.7,.3,1)",
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = T.shadowLg;
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = T.shadowMd;
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
