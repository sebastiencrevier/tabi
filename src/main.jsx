// ============================================================
// MAIN — point d'entrée Vite
// Monte l'app, supprime l'écran de chargement (#boot) après le 1er rendu.
// ============================================================

import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

// Marqueur de version accessible dans la console (debug)
window.__TABI_VERSION__ = "FIX-8";
console.log(
  "%c旅 Tabi VERSION FIX-8",
  "color:#C8443B;font-weight:bold;font-size:14px"
);

function mount() {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("L'élément #root est introuvable dans le HTML.");
    return;
  }
  const root = createRoot(rootEl);
  root.render(<App />);

  // Cache l'écran de chargement après le premier rendu
  requestAnimationFrame(() => {
    setTimeout(() => {
      const boot = document.getElementById("boot");
      if (boot) {
        boot.style.opacity = 0;
        setTimeout(() => boot.remove && boot.remove(), 400);
      }
    }, 120);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
