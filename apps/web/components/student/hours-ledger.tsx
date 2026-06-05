"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { hoursLog, tints } from "@/lib/mock-data";
import type { LogStatus, ShiftLog } from "@/lib/types/student";
import {
  HoursFilters,
  type CategoryFilter,
  type SortOption,
  type StatusFilter,
} from "@/components/student/hours-filters";
import { useMemo, useState } from "react";

const statusConfig: Record<
  LogStatus,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  verified: {
    label: "Verified",
    className: "text-success",
    icon: BadgeCheck,
  },
  pending: {
    label: "Pending",
    className: "text-pending",
    icon: Clock3,
  },
  flagged: {
    label: "Flagged",
    className: "text-flagged",
    icon: AlertTriangle,
  },
};

function parseDisplayDate(date: string): number {
  return new Date(date).getTime() || 0;
}

function isEligibleForQr(log: ShiftLog): boolean {
  return (
    log.status === "pending" &&
    !log.qrToken &&
    new Date(log.completedAt).getTime() < Date.now()
  );
}

function sortLogs(logs: ShiftLog[], sort: SortOption): ShiftLog[] {
  const sorted = [...logs];
  if (sort === "most-hours") {
    return sorted.sort((a, b) => b.hours - a.hours);
  }
  if (sort === "oldest") {
    return sorted.sort(
      (a, b) => parseDisplayDate(a.date) - parseDisplayDate(b.date),
    );
  }
  return sorted.sort(
    (a, b) => parseDisplayDate(b.date) - parseDisplayDate(a.date),
  );
}

export function HoursLedger() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const filteredLogs = useMemo(() => {
    let logs = hoursLog;
    if (status !== "all") {
      logs = logs.filter((log) => log.status === status);
    }
    if (category !== "all") {
      logs = logs.filter((log) => log.categoryKey === category);
    }
    return sortLogs(logs, sort);
  }, [status, category, sort]);

  const counts = useMemo(
    () => ({
      verified: hoursLog.filter((l) => l.status === "verified").length,
      pending: hoursLog.filter((l) => l.status === "pending").length,
      flagged: hoursLog.filter((l) => l.status === "flagged").length,
    }),
    [],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-pill bg-accent-lavender px-4 py-2 text-[13px] font-semibold text-primary">
          {counts.verified} verified
        </span>
        <span className="rounded-pill bg-accent-sky px-4 py-2 text-[13px] font-semibold text-icon-sky">
          {counts.pending} pending
        </span>
        <span className="rounded-pill bg-accent-pink px-4 py-2 text-[13px] font-semibold text-flagged">
          {counts.flagged} flagged
        </span>
      </div>

      <HoursFilters
        status={status}
        category={category}
        sort={sort}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onSortChange={setSort}
      />

      <div className="hidden overflow-hidden rounded-card bg-surface shadow-card lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              <th className="px-6 py-4">Organization</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Activity</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((row) => {
              const tint = tints[row.categoryTint];
              const statusInfo = statusConfig[row.status];
              const StatusIcon = statusInfo.icon;
              return (
                <tr key={row.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.avatar}
                        alt=""
                        className="h-10 w-10 rounded-xl bg-accent-lavender object-cover"
                      />
                      <div>
                        <p className="text-[14px] font-semibold">{row.org}</p>
                        <p className="text-[12px] text-muted">{row.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-ink/80">
                    {row.activity}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-bold">
                    {row.hours} hrs
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${statusInfo.className}`}
                    >
                      <StatusIcon size={16} />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEligibleForQr(row) ? (
                      <Link
                        href={`/log-hours/${row.id}/qr`}
                        className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-primary-deep"
                      >
                        <QrCode size={14} />
                        Get QR
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 text-primary transition hover:bg-accent-lavender"
                      >
                        <ArrowUpRight size={17} strokeWidth={2.4} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {filteredLogs.map((row) => {
          const tint = tints[row.categoryTint];
          const statusInfo = statusConfig[row.status];
          const StatusIcon = statusInfo.icon;
          return (
            <div
              key={row.id}
              className="rounded-card bg-surface p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.avatar}
                  alt=""
                  className="h-10 w-10 rounded-xl bg-accent-lavender object-cover"
                />
                <div>
                  <p className="text-[14px] font-semibold">{row.org}</p>
                  <p className="text-[12px] text-muted">{row.date}</p>
                </div>
              </div>
              <p className="mt-3 text-[14px] text-ink/80">{row.activity}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                >
                  {row.category}
                </span>
                <span className="text-[14px] font-bold">{row.hours} hrs</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${statusInfo.className}`}
                >
                  <StatusIcon size={16} />
                  {statusInfo.label}
                </span>
              </div>
              {isEligibleForQr(row) ? (
                <Link
                  href={`/log-hours/${row.id}/qr`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white"
                >
                  <QrCode size={14} />
                  Get QR
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
