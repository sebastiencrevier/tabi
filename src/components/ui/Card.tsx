import { T } from "../../constants";
import type { ReactNode, CSSProperties } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  hover?: boolean;
  className?: string;
  [key: string]: unknown;
}

export function Card({ children, style = {}, hover = false, className, ...p }: CardProps) {
  return (
    <div
      {...p}
      className={clsx(
        "bg-card rounded-[18px] border border-line",
        "transition-all duration-[220ms] ease-[cubic-bezier(.2,.7,.3,1)]",
        hover && "hover:-translate-y-[3px] hover:shadow-lg",
        className
      )}
      style={{ boxShadow: T.shadowMd, ...style }}
    >
      {children}
    </div>
  );
}
