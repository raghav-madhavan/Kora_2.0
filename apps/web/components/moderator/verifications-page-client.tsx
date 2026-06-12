"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, BadgeCheck, Inbox, Search } from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { useModeratorSession } from "@/components/moderator/session-provider";
import { VerificationRow } from "@/components/moderator/verification-row";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { scopeShifts } from "@/lib/auth/scope";
import { moderatorShifts } from "@/lib/mock-data-moderator";
import {
  filterOrgLogs,
  toVerificationTab,
  type VerificationTab,
} from "@/lib/verifications";

export function VerificationsPageClient() {
  const { logs, pendingCount, flaggedCount } = useOrgLogs();
  const { session } = useModeratorSession();
  const accessibleShifts = useMemo(
    () => scopeShifts(session, moderatorShifts),
    [session],
  );
  const params = useSearchParams();
  const [tab, setTab] = useState<VerificationTab>(() =>
    toVerificationTab(params.get("status")),
  );
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [shiftId, setShiftId] = useState(() => {
    const raw = params.get("shift");
    return raw && accessibleShifts.some((s) => s.id === raw) ? raw : "";
  });

  const syncUrl = useCallback(
    (next: { tab: VerificationTab; q: string; shiftId: string }) => {
      const search = new URLSearchParams();
      if (next.tab !== "pending") search.set("status", next.tab);
      if (next.q.trim()) search.set("q", next.q.trim());
      if (next.shiftId) search.set("shift", next.shiftId);
      const query = search.toString();
      window.history.replaceState(
        null,
        "",
        query ? `/moderator/verifications?${query}` : "/moderator/verifications",
      );
    },
    [],
  );

  const tabs: { id: VerificationTab; label: string; count?: number }[] = [
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "flagged", label: "Flagged", count: flaggedCount },
    { id: "history", label: "History" },
  ];

  const visible = useMemo(
    () => filterOrgLogs(logs, { tab, q, shiftId: shiftId || undefined }),
    [logs, tab, q, shiftId],
  );

  const hasFilters = q.trim().length > 0 || shiftId.length > 0;

  const emptyState = hasFilters
    ? {
        icon: Search,
        title: "No matching claims",
        body: "Try a different student name, shift, or clear the filters.",
        iconClass: "text-muted",
      }
    : {
        pending: {
          icon: BadgeCheck,
          title: "Nothing pending",
          body: "All submitted claims have been reviewed. New manual claims will land here.",
          iconClass: "text-success",
        },
        flagged: {
          icon: AlertTriangle,
          title: "No flagged claims",
          body: "Claims held by fraud checks will appear here for a closer look.",
          iconClass: "text-muted",
        },
        history: {
          icon: Inbox,
          title: "No decisions yet",
          body: "Approved and rejected claims will build a history here.",
          iconClass: "text-muted",
        },
      }[tab];

  const EmptyIcon = emptyState.icon;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Verification queues"
        className="mb-4 flex flex-wrap gap-2"
      >
        {tabs.map(({ id, label, count }) => {
          const active = tab === id;
          return (
            <FilterChip
              key={id}
              role="tab"
              aria-selected={active}
              active={active}
              count={count}
              onClick={() => {
                setTab(id);
                syncUrl({ tab: id, q, shiftId });
              }}
            >
              {label}
            </FilterChip>
          );
        })}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search claims</span>
          <Search
            size={16}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              syncUrl({ tab, q: event.target.value, shiftId });
            }}
            placeholder="Search by student, shift, or school"
            className="w-full rounded-pill bg-surface py-2.5 pl-11 pr-4 text-[14px] shadow-card outline-none ring-primary/40 placeholder:text-muted focus:ring-2"
          />
        </label>
        <label>
          <span className="sr-only">Filter by shift</span>
          <select
            value={shiftId}
            onChange={(event) => {
              setShiftId(event.target.value);
              syncUrl({ tab, q, shiftId: event.target.value });
            }}
            className="w-full rounded-pill bg-surface px-4 py-2.5 text-[14px] font-semibold shadow-card outline-none ring-primary/40 focus:ring-2 sm:w-auto"
          >
            <option value="">All shifts</option>
            {accessibleShifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={EmptyIcon}
          title={emptyState.title}
          body={emptyState.body}
          iconClassName={emptyState.iconClass}
        />
      ) : (
        <div key={tab} className="stagger flex flex-col gap-4">
          {visible.map((log) => (
            <VerificationRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
