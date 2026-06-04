import React from "react";
import { T } from "../../constants.js";
import { X } from "../icons.js";

/**
 * Pastille colorée pour afficher un statut ou une catégorie.
 * Ex : <Pill color={T.vermilion} soft={T.vermSoft} icon={Star}>Favori</Pill>
 */
export function Pill({ children, color = T.ink2, soft = T.paper2, icon: Icon, style = {} }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: soft,
        ...style,
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

/**
 * Champ de formulaire unifié : input, textarea ou select selon les props.
 * - `options` (array) → select
 * - `rows` (number) → textarea
 * - sinon → input avec `type` (par défaut "text")
 */
export function Field({ label, value, onChange, type = "text", placeholder, options, rows, style = {} }) {
  const common = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 11,
    border: `1px solid ${T.line}`,
    background: T.paper,
    fontSize: 14,
    color: T.ink,
    fontFamily: "inherit",
    outline: "none",
    transition: "border .15s",
    boxSizing: "border-box",
  };
  return (
    <label style={{ display: "block", ...style }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>{label}</div>
      )}
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={common}
          onFocus={(e) => (e.target.style.borderColor = T.vermilion)}
          onBlur={(e) => (e.target.style.borderColor = T.line)}
        >
          {options.map((o) =>
            typeof o === "object" ? (
              <option key={o.value} value={o.value}>{o.label}</option>
            ) : (
              <option key={o} value={o}>{o}</option>
            )
          )}
        </select>
      ) : rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...common, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = T.vermilion)}
          onBlur={(e) => (e.target.style.borderColor = T.line)}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={common}
          onFocus={(e) => (e.target.style.borderColor = T.vermilion)}
          onBlur={(e) => (e.target.style.borderColor = T.line)}
        />
      )}
    </label>
  );
}

/**
 * Modal centrée avec backdrop flou. Ferme au clic en dehors ou sur X.
 * `footer` reçoit les boutons d'action (annuler, confirmer).
 */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(28,26,23,.32)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "tabiFade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: 22,
          width: "100%",
          maxWidth: 480,
          maxHeight: "88vh",
          overflow: "auto",
          boxShadow: T.shadowLg,
          animation: "tabiPop .26s cubic-bezier(.2,.8,.3,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: `1px solid ${T.line}`,
            position: "sticky",
            top: 0,
            background: T.card,
            zIndex: 2,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 19, fontFamily: "'Fraunces', serif", fontWeight: 600, color: T.ink }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: T.paper2,
              border: "none",
              borderRadius: 10,
              width: 34,
              height: 34,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: T.ink2,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 24, display: "grid", gap: 14 }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: `1px solid ${T.line}`,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Barre de progression. */
export function Progress({ value, max, color = T.vermilion, height = 8 }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div style={{ background: T.paper2, borderRadius: 99, height, overflow: "hidden" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width .6s cubic-bezier(.2,.8,.3,1)",
        }}
      />
    </div>
  );
}

/** Donut SVG animé pour visualiser des proportions (budget, etc.). */
export function Donut({ segments, size = 150, stroke = 18, center }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paper2} strokeWidth={stroke} />
      {segments.map((s, i) => {
        const frac = s.value / total;
        const dash = frac * circ;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray .8s cubic-bezier(.2,.8,.3,1)" }}
          />
        );
        offset += dash;
        return el;
      })}
      {center && (
        <foreignObject x="0" y="0" width={size} height={size}>
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", textAlign: "center" }}>
            {center}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

/** État vide d'une section avec icône et call-to-action optionnel. */
export function Empty({ icon: Icon, text, action }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: T.ink3 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: T.paper2,
          display: "grid",
          placeItems: "center",
          margin: "0 auto 14px",
        }}
      >
        <Icon size={26} strokeWidth={1.6} />
      </div>
      <div style={{ fontSize: 14, marginBottom: action ? 16 : 0 }}>{text}</div>
      {action}
    </div>
  );
}

/** En-tête de section avec sur-titre rouge, titre serif, sous-titre, action à droite. */
export function SectionTitle({ kicker, title, sub, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 20,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        {kicker && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: T.vermilion,
              marginBottom: 6,
            }}
          >
            {kicker}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: 30,
            color: T.ink,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </h1>
        {sub && <p style={{ margin: "6px 0 0", color: T.ink2, fontSize: 14 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
