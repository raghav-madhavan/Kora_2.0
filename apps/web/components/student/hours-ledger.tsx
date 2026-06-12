"use client";

import Link from "next/link";
import { ArrowUpRight, AlertTriangle, BadgeCheck, Clock3, Inbox, Search } from "lucide-react";
import { tints } from "@/lib/mock-data";
import type { ShiftLog } from "@/lib/types/student";
import {
  HoursFilters,
  type CategoryFilter,
  type SortOption,
  type StatusFilter,
} from "@/components/student/hours-filters";
import { useHours } from "@/components/student/hours-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { LogStatusChip } from "@/components/shared/log-status-chip";
import { StatCard } from "@/components/shared/stat-card";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function parseDisplayDate(date: string): number {
  return new Date(date).getTime() || 0;
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

const STATUS_VALUES: StatusFilter[] = [
  "all",
  "verified",
  "pending",
  "flagged",
  "rejected",
];
const CATEGORY_VALUES: CategoryFilter[] = [
  "all",
  "community",
  "environment",
  "education",
];

function toStatusFilter(raw: string | null): StatusFilter {
  return STATUS_VALUES.includes(raw as StatusFilter)
    ? (raw as StatusFilter)
    : "all";
}

function toCategoryFilter(raw: string | null): CategoryFilter {
  return CATEGORY_VALUES.includes(raw as CategoryFilter)
    ? (raw as CategoryFilter)
    : "all";
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function HoursLedger() {
  const { logs } = useHours();
  const params = useSearchParams();
  const [status, setStatus] = useState<StatusFilter>(() =>
    toStatusFilter(params.get("status")),
  );
  const [category, setCategory] = useState<CategoryFilter>(() =>
    toCategoryFilter(params.get("category")),
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const search = params.get("q") ?? "";

  const filteredLogs = useMemo(() => {
    let filtered = logs;
    if (status !== "all") {
      filtered = filtered.filter((log) => log.status === status);
    }
    if (category !== "all") {
      filtered = filtered.filter((log) => log.categoryKey === category);
    }
    const query = search.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (log) =>
          log.org.toLowerCase().includes(query) ||
          log.activity.toLowerCase().includes(query),
      );
    }
    return sortLogs(filtered, sort);
  }, [logs, status, category, sort, search]);

  const counts = useMemo(
    () => ({
      verified: logs.filter((l) => l.status === "verified").length,
      pending: logs.filter((l) => l.status === "pending").length,
      flagged: logs.filter((l) => l.status === "flagged").length,
    }),
    [logs],
  );

  const hasFilters =
    status !== "all" ||
    category !== "all" ||
    search.trim().length > 0 ||
    sort !== "newest";

  const emptyState = hasFilters
    ? {
        icon: Search,
        title: "No matching hours",
        body: "Try a different status, category, or search term.",
        iconClassName: "text-muted",
      }
    : logs.length === 0
      ? {
          icon: Inbox,
          title: "No hours logged yet",
          body: "Scan a shift QR code or submit a manual claim to start building your ledger.",
          iconClassName: "text-muted",
        }
      : {
          icon: Clock3,
          title: "Nothing in this view",
          body: "Switch filters to see your full hour history.",
          iconClassName: "text-muted",
        };

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-5 xl:grid-cols-3">
        <StatCard
          label="Verified"
          value={String(counts.verified)}
          icon={BadgeCheck}
          tint="sky"
          caption="Count toward requirements"
        />
        <StatCard
          label="Pending"
          value={String(counts.pending)}
          icon={Clock3}
          tint="lavender"
          caption="Awaiting moderator review"
        />
        <StatCard
          label="Flagged"
          value={String(counts.flagged)}
          icon={AlertTriangle}
          tint="pink"
          caption="Held for counselor review"
        />
      </div>

      <HoursFilters
        status={status}
        category={category}
        sort={sort}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onSortChange={setSort}
      />

      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          body={emptyState.body}
          iconClassName={emptyState.iconClassName}
          action={
            logs.length === 0 ? (
              <Link
                href="/log-hours"
                className="rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.98]"
              >
                Log hours
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-card bg-surface shadow-card lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/80">
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
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-black/5 transition-colors hover:bg-canvas/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.avatar}
                            alt=""
                            className="h-11 w-11 rounded-xl bg-accent-lavender object-cover"
                          />
                          <div>
                            <p className="text-[15px] font-bold">{row.org}</p>
                            <p className="text-[12px] text-muted">{row.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-semibold ${tint.bg} ${tint.fg}`}
                        >
                          {row.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-ink/80">
                        {row.activity}
                      </td>
                      <td className="px-6 py-4 font-mono text-[14px] font-semibold tabular-nums">
                        {formatHours(row.hours)} hrs
                      </td>
                      <td className="px-6 py-4">
                        <LogStatusChip status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/hours/${row.id}`}
                          className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 text-primary transition hover:bg-accent-lavender active:scale-[0.97]"
                        >
                          <ArrowUpRight size={17} strokeWidth={2.4} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="stagger flex flex-col gap-4 lg:hidden">
            {filteredLogs.map((row) => {
              const tint = tints[row.categoryTint];
              return (
                <Link
                  key={row.id}
                  href={`/hours/${row.id}`}
                  className="rounded-card bg-surface p-5 shadow-card transition hover:shadow-raised active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.avatar}
                      alt=""
                      className="h-11 w-11 rounded-xl bg-accent-lavender object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold">{row.org}</p>
                      <p className="text-[12px] text-muted">{row.date}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[14px] text-ink/80">{row.activity}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-semibold ${tint.bg} ${tint.fg}`}
                    >
                      {row.category}
                    </span>
                    <span className="font-mono text-[14px] font-semibold tabular-nums">
                      {formatHours(row.hours)} hrs
                    </span>
                    <LogStatusChip status={row.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
