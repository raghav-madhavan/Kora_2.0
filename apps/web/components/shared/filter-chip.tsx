"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  children: ReactNode;
}

export function FilterChip({
  active = false,
  count,
  children,
  className = "",
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors duration-200 active:scale-[0.98] ${
        active
          ? "bg-panel text-cream shadow-card"
          : "bg-surface text-muted shadow-card hover:text-ink"
      } ${className}`}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span
          className={`rounded-pill px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
            active ? "bg-cream/15 text-cream" : "bg-canvas text-muted"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
