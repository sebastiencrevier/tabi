import { T } from "../../constants";
import type { ReactNode, CSSProperties } from "react";
import { clsx } from "clsx";

interface BtnProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "accent" | "ghost" | "soft" | "outline";
  size?: "sm" | "md";
  style?: CSSProperties;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  [key: string]: unknown;
}

const variantStyles: Record<string, CSSProperties> = {
  primary: { background: T.ink, color: "#fff" },
  accent: { background: T.vermilion, color: "#fff" },
  ghost: { background: "transparent", color: T.ink2 },
  soft: { background: T.paper2, color: T.ink },
  outline: { background: T.card, color: T.ink, boxShadow: `inset 0 0 0 1px ${T.line}` },
};

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  style = {},
  className,
  type = "button",
  ...p
}: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-[7px] cursor-pointer border-none rounded-xl font-semibold font-sans",
        "transition-all duration-[180ms] ease-[cubic-bezier(.2,.7,.3,1)] whitespace-nowrap",
        "hover:-translate-y-px hover:brightness-105",
        size === "sm" ? "text-[13px] px-3 py-[7px]" : "text-sm px-4 py-[10px]",
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...p}
    >
      {children}
    </button>
  );
}
