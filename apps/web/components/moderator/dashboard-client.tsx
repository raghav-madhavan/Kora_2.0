"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  QrCode,
} from "lucide-react";
import { DashboardNextAction } from "@/components/moderator/dashboard-next-action";
import { DashboardReviewItem } from "@/components/moderator/dashboard-review-item";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import type { ModeratorShift } from "@/lib/types/moderator";

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function DashboardClient({
  upcomingShifts,
}: {
  upcomingShifts: ModeratorShift[];
}) {
  const { logs, pendingCount, flaggedCount } = useOrgLogs();

  const verifiedHours = logs
    .filter((log) => log.status === "verified")
    .reduce((sum, log) => sum + log.hours, 0);

  const needsReview = logs
    .filter((log) => log.status === "pending" || log.status === "flagged")
    .slice(0, 8);

  const nextShift = upcomingShifts[0];
  const viewAllHref =
    pendingCount + flaggedCount > 0
      ? "/moderator/verifications?sort=oldest"
      : "/moderator/verifications";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <StatCard
          label="Pending review"
          value={String(pendingCount)}
          icon={Clock3}
          tint="lavender"
          caption="Manual claims awaiting you"
        />
        <StatCard
          label="Flagged"
          value={String(flaggedCount)}
          icon={AlertTriangle}
          tint="pink"
          caption="Held by fraud checks"
        />
        <StatCard
          label="Verified hours"
          value={formatHours(verifiedHours)}
          icon={BadgeCheck}
          tint="sky"
          caption="Counted toward requirements"
        />
        <StatCard
          label="Upcoming shifts"
          value={String(upcomingShifts.length)}
          icon={CalendarDays}
          tint="lavender"
          caption="On the City Parks calendar"
        />
      </div>

      <DashboardNextAction upcomingShifts={upcomingShifts} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Needs review */}
        <section className="rounded-card bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-[20px] font-semibold tracking-tight">
              Needs review
            </h2>
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-[13px] font-semibold text-primary transition hover:text-primary-deep"
            >
              View all
              <ArrowUpRight size={14} strokeWidth={2.4} />
            </Link>
          </div>

          {needsReview.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="Queue is clear"
              body="Every submitted claim has been reviewed."
              iconClassName="text-success"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-black/5">
              {needsReview.map((log, index) => (
                <DashboardReviewItem
                  key={log.id}
                  log={log}
                  className={index >= 4 ? "hidden xl:flex" : ""}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Next shift */}
        <section className="flex flex-col rounded-card bg-surface p-6 shadow-card">
          <h2 className="mb-4 font-display text-[20px] font-semibold tracking-tight">
            Next shift
          </h2>
          {nextShift ? (
            <>
              <div className="overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nextShift.img}
                  alt={nextShift.title}
                  className="h-32 w-full object-cover"
                />
              </div>
              <p className="mt-4 text-[16px] font-bold leading-snug">
                {nextShift.title}
              </p>
              <p className="mt-1 text-[13px] text-muted">{nextShift.date}</p>
              <p className="text-[13px] text-muted">{nextShift.location}</p>
              <p className="mb-5 mt-2 font-mono text-[12px] text-muted">
                {nextShift.committedCount}/{nextShift.slots} slots committed
              </p>
              <Link
                href={`/moderator/shifts/${nextShift.id}`}
                className="mt-auto flex items-center justify-center gap-2 rounded-pill bg-panel px-5 py-2.5 text-[14px] font-semibold text-cream transition hover:bg-primary-deep"
              >
                <QrCode size={16} strokeWidth={2.2} />
                Display check-in QR
              </Link>
            </>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming shifts"
              body="New shifts will appear here once scheduled."
            />
          )}
        </section>
      </div>
    </div>
  );
}
