import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { tints } from "@/lib/mock-data";
import type { ScheduleStatus } from "@/lib/schedule";
import type { Shift, ShiftLog } from "@/lib/types/student";

const statusConfig: Record<
  ScheduleStatus,
  { label: string; className: string; cta: string; href: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-accent-sky text-icon-sky",
    cta: "View shift",
    href: "",
  },
  today: {
    label: "Today",
    className: "bg-primary/15 text-primary",
    cta: "Enter code",
    href: "/log-hours#check-in",
  },
  needs_checkin: {
    label: "Needs check-in",
    className: "bg-accent-pink text-flagged",
    cta: "Enter code",
    href: "/log-hours#check-in",
  },
  complete: {
    label: "Complete",
    className: "bg-success/15 text-success",
    cta: "View hours",
    href: "",
  },
};

interface ScheduleShiftRowProps {
  shift: Shift;
  status: ScheduleStatus;
  verifiedLog?: ShiftLog;
}

export function ScheduleShiftRow({
  shift,
  status,
  verifiedLog,
}: ScheduleShiftRowProps) {
  const tint = tints[shift.categoryTint];
  const config = statusConfig[status];
  const ctaHref =
    status === "complete" && verifiedLog
      ? `/hours/${verifiedLog.id}`
      : status === "upcoming"
        ? `/events/${shift.id}`
        : config.href;

  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${config.className}`}
          >
            {config.label}
          </span>
          <span
            className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
          >
            {shift.category}
          </span>
        </div>
        <h3 className="text-[16px] font-bold">{shift.title}</h3>
        <p className="mt-1 text-[13px] text-muted">{shift.org}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink/80">
          <Clock size={14} className="text-muted" />
          {shift.date} · {shift.hours} hrs
        </p>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
      >
        {config.cta}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
