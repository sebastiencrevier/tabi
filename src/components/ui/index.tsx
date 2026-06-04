import React from "react";
import { T } from "../../constants";
import { X } from "../icons";
import type { ReactNode, CSSProperties, ComponentType } from "react";
import type { IconProps } from "../icons";

/* ── Pill ──────────────────────────────────────────────── */
interface PillProps {
  children: ReactNode;
  color?: string;
  soft?: string;
  icon?: ComponentType<IconProps>;
  style?: CSSProperties;
}

export function Pill({
  children,
  color = T.ink2,
  soft = T.paper2,
  icon: Icon,
  style = {},
}: PillProps) {
  return (
    <span
      style={{ color, background: soft, ...style }}
      className="inline-flex items-center gap-[5px] px-[10px] py-1 rounded-full text-xs font-semibold"
    >
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

/* ── Field ─────────────────────────────────────────────── */
interface FieldOption {
  value: string;
  label: string;
}

interface FieldProps {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  options?: (FieldOption | string)[];
  rows?: number;
  style?: CSSProperties;
}

const fieldInputClass =
  "w-full px-3 py-[10px] rounded-[11px] border border-line bg-paper text-sm text-ink font-sans outline-none transition-[border-color] duration-150";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
  rows,
  style = {},
}: FieldProps) {
  return (
    <label className="block" style={style}>
      {label && <div className="text-xs font-semibold text-ink2 mb-1.5">{label}</div>}
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldInputClass}
          onFocus={(e) => (e.target.style.borderColor = T.vermilion)}
          onBlur={(e) => (e.target.style.borderColor = "")}
        >
          {options.map((o) =>
            typeof o === "object" ? (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ) : (
              <option key={o} value={o}>
                {o}
              </option>
            )
          )}
        </select>
      ) : rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${fieldInputClass} resize-y`}
          onFocus={(e) => (e.target.style.borderColor = T.vermilion)}
          onBlur={(e) => (e.target.style.borderColor = "")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={fieldInputClass}
          onFocus={(e) => (e.target.style.borderColor = T.vermilion)}
          onBlur={(e) => (e.target.style.borderColor = "")}
        />
      )}
    </label>
  );
}

/* ── Modal ─────────────────────────────────────────────── */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 animate-tabi-fade"
      style={{ background: "rgba(28,26,23,.32)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-[22px] w-full max-w-[480px] max-h-[88vh] overflow-auto animate-tabi-pop"
        style={{ boxShadow: T.shadowLg }}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-line sticky top-0 bg-card z-[2]">
          <h3 className="m-0 text-[19px] font-serif font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="bg-paper2 border-none rounded-[10px] w-[34px] h-[34px] cursor-pointer grid place-items-center text-ink2"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid gap-[14px]">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-line flex gap-[10px] justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ── Progress ──────────────────────────────────────────── */
interface ProgressProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export function Progress({ value, max, color = T.vermilion, height = 8 }: ProgressProps) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div className="bg-paper2 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.3,1)]"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/* ── Donut ─────────────────────────────────────────────── */
interface DonutSegment {
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  center?: ReactNode;
}

export function Donut({ segments, size = 150, stroke = 18, center }: DonutProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={T.paper2}
        strokeWidth={stroke}
      />
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
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            {center}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

/* ── Empty ─────────────────────────────────────────────── */
interface EmptyProps {
  icon: ComponentType<IconProps>;
  text: string;
  action?: ReactNode;
}

export function Empty({ icon: Icon, text, action }: EmptyProps) {
  return (
    <div className="text-center py-12 px-5 text-ink3">
      <div className="w-14 h-14 rounded-2xl bg-paper2 grid place-items-center mx-auto mb-[14px]">
        <Icon size={26} strokeWidth={1.6} />
      </div>
      <div className="text-sm" style={{ marginBottom: action ? 16 : 0 }}>
        {text}
      </div>
      {action}
    </div>
  );
}

/* ── SectionTitle ──────────────────────────────────────── */
interface SectionTitleProps {
  kicker?: string;
  title: string;
  sub?: string;
  right?: ReactNode;
}

export function SectionTitle({ kicker, title, sub, right }: SectionTitleProps) {
  return (
    <div className="flex justify-between items-end mb-5 gap-4 flex-wrap">
      <div>
        {kicker && (
          <div className="text-xs font-bold tracking-[1.5px] uppercase text-vermilion mb-1.5">
            {kicker}
          </div>
        )}
        <h1 className="m-0 font-serif font-semibold text-[30px] text-ink tracking-[-0.5px]">
          {title}
        </h1>
        {sub && <p className="mt-1.5 mb-0 text-ink2 text-sm">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
