import type { LucideIcon } from "lucide-react";
import { tints } from "@/lib/mock-data";
import type { TintKey } from "@/lib/types/student";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tint: TintKey;
  caption?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  caption,
}: StatCardProps) {
  const tintStyle = tints[tint];

  return (
    <div className="rounded-card bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/80">
          {label}
        </p>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tintStyle.bg}`}
        >
          <Icon size={18} strokeWidth={2.2} className={tintStyle.fg} />
        </span>
      </div>
      <p className="mt-2 font-display text-[34px] font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      {caption ? (
        <p className="mt-2 text-[13px] text-muted">{caption}</p>
      ) : null}
    </div>
  );
}
