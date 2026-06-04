import React from "react";
import { T } from "../constants.js";

/**
 * Styles globaux injectés une fois dans <head> :
 * - Polices Google (Fraunces serif + Outfit sans-serif)
 * - Scrollbar customisée
 * - Animations (tabiFade, tabiPop, tabiSlide, tabiPulse)
 * - Responsive mobile (cellules de table scrollables, font-size 16px sur inputs
 *   pour éviter le zoom auto de Safari iOS)
 */
export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Outfit:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      ::selection { background: ${T.vermSoft}; }
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 99px; border: 3px solid ${T.paper}; }
      ::-webkit-scrollbar-thumb:hover { background: ${T.ink3}; }
      input, select, textarea { font-family: 'Outfit', sans-serif; }
      .tabi-row:hover { background: ${T.paper2} !important; }
      .tabi-del { opacity: 0; transition: opacity .15s; }
      .tabi-row:hover .tabi-del, .tabi-trow:hover .tabi-del, *:hover > .tabi-del { opacity: 1; }
      .tabi-trow:hover { background: ${T.paper}; }
      .tabi-bottomnav::-webkit-scrollbar { display: none; }
      .tabi-bottomnav { scrollbar-width: none; }
      @keyframes tabiFade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes tabiPop { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes tabiSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes tabiPulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
      @media (max-width: 860px) {
        .tabi-2col { grid-template-columns: 1fr !important; }
        .tabi-table { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .tabi-thead, .tabi-trow { min-width: 580px; }
        input, select, textarea { font-size: 16px !important; }
        .tabi-cardgrid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}
