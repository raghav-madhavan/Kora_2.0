"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, QrCode } from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import type { ModeratorShift } from "@/lib/types/moderator";

interface NextAction {
  eyebrow: string;
  headline: string;
  subline: string;
  href: string;
  icon: typeof QrCode;
}

/**
 * One-tap action card for mobile and tablet, where the review queue and
 * next-shift panels sit far below the stats.
 */
export function DashboardNextAction({
  upcomingShifts,
}: {
  upcomingShifts: ModeratorShift[];
}) {
  const { pendingCount, flaggedCount } = useOrgLogs();
  const reviewCount = pendingCount + flaggedCount;
  const nextShift = upcomingShifts[0];

  let action: NextAction;
  if (reviewCount > 0) {
    action = {
      eyebrow: "Up next",
      headline: `Review ${reviewCount} claim${reviewCount === 1 ? "" : "s"}`,
      subline:
        flaggedCount > 0
          ? `${flaggedCount} held by fraud checks`
          : "Manual claims are waiting on you",
      href: "/moderator/verifications",
      icon: BadgeCheck,
    };
  } else if (nextShift) {
    action = {
      eyebrow: "Queue is clear",
      headline: "Display check-in QR",
      subline: `${nextShift.title} · ${nextShift.date}`,
      href: `/moderator/shifts/${nextShift.id}`,
      icon: QrCode,
    };
  } else {
    action = {
      eyebrow: "All caught up",
      headline: "Browse your shifts",
      subline: "New shifts will appear on the calendar",
      href: "/moderator/shifts",
      icon: CalendarDays,
    };
  }

  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-4 rounded-card bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-raised xl:hidden"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-panel text-cream transition group-hover:bg-primary-deep">
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          {action.eyebrow}
        </p>
        <p className="truncate text-[15px] font-bold text-ink">
          {action.headline}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-muted">
          {action.subline}
        </p>
      </div>
      <ArrowRight
        size={18}
        strokeWidth={2.2}
        className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}
