"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, BadgeCheck, Inbox, MousePointerClick, Search } from "lucide-react";
import { FlagReviewGate } from "@/components/moderator/flag-review-gate";
import { FraudClusterBanner } from "@/components/moderator/fraud-cluster-banner";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { RejectReasonModal } from "@/components/moderator/reject-reason-modal";
import { useModeratorSession } from "@/components/moderator/session-provider";
import { VerificationDetail } from "@/components/moderator/verification-detail";
import {
  type QueueDensity,
  VerificationQueueToolbar,
} from "@/components/moderator/verification-queue-toolbar";
import { VerificationRow } from "@/components/moderator/verification-row";
import { VerificationSplitPane } from "@/components/moderator/verification-split-pane";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { useToast } from "@/components/student/toast-provider";
import { scopeShifts } from "@/lib/auth/scope";
import { moderatorShifts } from "@/lib/mock-data-moderator";
import type { FraudCluster, OrgLogSort } from "@/lib/verifications";
import {
  filterOrgLogs,
  groupFlaggedByReason,
  sortOrgLogs,
  toOrgLogSort,
  toVerificationTab,
  type VerificationTab,
} from "@/lib/verifications";
import type { OrgShiftLog } from "@/lib/types/moderator";

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

interface GateState {
  ids: string[];
  reason: string;
  subject: string;
}

export function VerificationsPageClient() {
  const { logs, pendingCount, flaggedCount, approveMany, rejectMany, refresh } =
    useOrgLogs();
  const { session } = useModeratorSession();
  const toast = useToast();
  const accessibleShifts = useMemo(
    () => scopeShifts(session, moderatorShifts),
    [session],
  );
  const params = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const isDesktop = useIsDesktop();
  const [isPending, startTransition] = useTransition();

  const [tab, setTab] = useState<VerificationTab>(() =>
    toVerificationTab(params.get("status")),
  );
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [shiftId, setShiftId] = useState(() => {
    const raw = params.get("shift");
    return raw && accessibleShifts.some((s) => s.id === raw) ? raw : "";
  });
  const [sort, setSort] = useState<OrgLogSort>(
    () => toOrgLogSort(params.get("sort")) ?? "oldest",
  );
  const [density, setDensity] = useState<QueueDensity>(() =>
    params.get("density") === "compact" ? "compact" : "comfortable",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(
    () => params.get("selected"),
  );
  const [gate, setGate] = useState<GateState | null>(null);
  const [rejectIds, setRejectIds] = useState<string[] | null>(null);
  const clusterAutoOpen = params.get("cluster") === "open";

  // Reflect view state back into the URL so triage is shareable / reloadable.
  useEffect(() => {
    const search = new URLSearchParams();
    if (tab !== "pending") search.set("status", tab);
    if (q.trim()) search.set("q", q.trim());
    if (shiftId) search.set("shift", shiftId);
    if (sort !== "oldest") search.set("sort", sort);
    if (density === "compact") search.set("density", "compact");
    if (activeId) search.set("selected", activeId);
    const query = search.toString();
    window.history.replaceState(
      null,
      "",
      query ? `/moderator/verifications?${query}` : "/moderator/verifications",
    );
  }, [tab, q, shiftId, sort, density, activeId]);

  const tabs: { id: VerificationTab; label: string; count?: number }[] = [
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "flagged", label: "Flagged", count: flaggedCount },
    { id: "history", label: "History" },
  ];

  const visible = useMemo(() => {
    const filtered = filterOrgLogs(logs, { tab, q, shiftId: shiftId || undefined });
    return sortOrgLogs(filtered, sort);
  }, [logs, tab, q, shiftId, sort]);

  const clusters = useMemo(
    () => (tab === "flagged" ? groupFlaggedByReason(visible) : []),
    [tab, visible],
  );

  const selectedVisible = useMemo(
    () => visible.filter((log) => selectedIds.has(log.id)),
    [visible, selectedIds],
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;

  const activeLog = useMemo(
    () => logs.find((log) => log.id === activeId) ?? null,
    [logs, activeId],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (visible.length > 0 && visible.every((log) => prev.has(log.id))) {
        return new Set();
      }
      return new Set(visible.map((log) => log.id));
    });
  }, [visible]);

  const doApprove = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      startTransition(async () => {
        try {
          const updated = await approveMany(ids);
          toast.success(
            updated.length === 1
              ? `${updated[0]?.studentName}'s hours approved`
              : `Approved ${updated.length} claims`,
          );
          clearSelection();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Could not approve hours",
          );
        }
      });
    },
    [approveMany, toast, clearSelection],
  );

  /** Approve, gating through FlagReviewGate when any target is flagged. */
  const approveIds = useCallback(
    (ids: string[]) => {
      const targets = ids
        .map((id) => logs.find((log) => log.id === id))
        .filter(
          (log): log is OrgShiftLog =>
            !!log && (log.status === "pending" || log.status === "flagged"),
        );
      if (targets.length === 0) return;

      const flagged = targets.filter((log) => log.status === "flagged");
      if (flagged.length > 0) {
        const reason =
          flagged.length === 1
            ? flagged[0]?.flagReason ?? "Held for review per school policy."
            : `${flagged.length} of these claims are held by fraud checks.`;
        const subject =
          targets.length === 1
            ? `${targets[0]?.studentName}'s claim`
            : `${targets.length} claims`;
        setGate({ ids: targets.map((log) => log.id), reason, subject });
        return;
      }
      doApprove(targets.map((log) => log.id));
    },
    [logs, doApprove],
  );

  const requestReject = useCallback(
    (ids: string[]) => {
      const targets = ids.filter((id) => {
        const log = logs.find((l) => l.id === id);
        return log && (log.status === "pending" || log.status === "flagged");
      });
      if (targets.length === 0) return;
      setRejectIds(targets);
    },
    [logs],
  );

  const doReject = useCallback(
    (reason: string) => {
      if (!rejectIds || rejectIds.length === 0) return;
      startTransition(async () => {
        try {
          const updated = await rejectMany(rejectIds, reason);
          toast.success(
            updated.length === 1
              ? `Claim rejected for ${updated[0]?.studentName}`
              : `Rejected ${updated.length} claims`,
          );
          setRejectIds(null);
          clearSelection();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Could not reject claim",
          );
        }
      });
    },
    [rejectIds, rejectMany, toast, clearSelection],
  );

  const openClaim = useCallback((id: string) => setActiveId(id), []);

  const selectCluster = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const approveCluster = useCallback(
    (cluster: FraudCluster) => approveIds(cluster.logIds),
    [approveIds],
  );
  const rejectCluster = useCallback(
    (cluster: FraudCluster) => requestReject(cluster.logIds),
    [requestReject],
  );

  // Switching tabs starts a fresh triage context.
  const switchTab = useCallback((next: VerificationTab) => {
    setTab(next);
    setSelectedIds(new Set());
    setActiveId(null);
  }, []);

  // Keyboard triage layer — no animation, page-local.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (typing || gate || rejectIds || visible.length === 0) return;

      const idx = activeId
        ? visible.findIndex((log) => log.id === activeId)
        : -1;

      if (event.key === "j") {
        event.preventDefault();
        const next = visible[Math.min(idx + 1, visible.length - 1)] ?? visible[0];
        if (next) setActiveId(next.id);
      } else if (event.key === "k") {
        event.preventDefault();
        const prev = visible[Math.max(idx - 1, 0)] ?? visible[0];
        if (prev) setActiveId(prev.id);
      } else if (event.key === "x" && activeId) {
        event.preventDefault();
        toggleSelect(activeId);
      } else if (event.key === "a") {
        const id = activeId ?? visible[0]?.id;
        if (id) {
          event.preventDefault();
          approveIds([id]);
        }
      } else if (event.key === "r") {
        const id = activeId ?? visible[0]?.id;
        if (id) {
          event.preventDefault();
          requestReject([id]);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, activeId, gate, rejectIds, toggleSelect, approveIds, requestReject]);

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
  const compact = density === "compact";

  const rejectSubject =
    rejectIds && rejectIds.length > 1
      ? `${rejectIds.length} claims`
      : rejectIds && rejectIds[0]
        ? logs.find((l) => l.id === rejectIds[0])?.studentName ?? "this student"
        : "this student";

  const list = (
    <div>
      {tab === "flagged" ? (
        <FraudClusterBanner
          clusters={clusters}
          onSelectCluster={selectCluster}
          onApproveCluster={approveCluster}
          onRejectCluster={rejectCluster}
          busy={isPending}
          defaultExpanded={clusterAutoOpen}
        />
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={EmptyIcon}
          title={emptyState.title}
          body={emptyState.body}
          iconClassName={emptyState.iconClass}
        />
      ) : (
        <div className={`flex flex-col ${compact ? "gap-2" : "gap-4"}`}>
          {visible.map((log) => (
            <VerificationRow
              key={log.id}
              log={log}
              compact={compact}
              selectable
              selected={selectedIds.has(log.id)}
              onSelect={toggleSelect}
              active={isDesktop && activeId === log.id}
              onOpen={isDesktop ? openClaim : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );

  const detail = activeLog ? (
    <VerificationDetail key={activeLog.id} initialLog={activeLog} embedded />
  ) : (
    <div className="rounded-card bg-surface p-10 text-center shadow-card">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-muted">
        <MousePointerClick size={22} strokeWidth={2} />
      </span>
      <p className="mt-4 text-[15px] font-bold">Select a claim to review</p>
      <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">
        Use <kbd className="font-mono">j</kbd> / <kbd className="font-mono">k</kbd>{" "}
        to move, <kbd className="font-mono">a</kbd> to approve,{" "}
        <kbd className="font-mono">r</kbd> to reject.
      </p>
    </div>
  );

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
              onClick={() => switchTab(id)}
            >
              {label}
            </FilterChip>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search claims</span>
          <Search
            size={16}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            ref={searchRef}
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by student, shift, or school  (press / )"
            className="w-full rounded-pill bg-surface py-2.5 pl-11 pr-4 text-[14px] shadow-card outline-none ring-primary/40 placeholder:text-muted focus:ring-2"
          />
        </label>
        <label>
          <span className="sr-only">Filter by shift</span>
          <select
            value={shiftId}
            onChange={(event) => setShiftId(event.target.value)}
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

      {visible.length > 0 ? (
        <VerificationQueueToolbar
          selectedCount={selectedVisible.length}
          totalCount={visible.length}
          allSelected={allSelected}
          onToggleAll={toggleAll}
          onClearSelection={clearSelection}
          onApproveSelected={() =>
            approveIds(selectedVisible.map((log) => log.id))
          }
          onRejectSelected={() =>
            requestReject(selectedVisible.map((log) => log.id))
          }
          sort={sort}
          onSortChange={setSort}
          density={density}
          onDensityToggle={() =>
            setDensity((prev) =>
              prev === "compact" ? "comfortable" : "compact",
            )
          }
          onRefresh={refresh}
          busy={isPending}
        />
      ) : null}

      <VerificationSplitPane list={list} detail={detail} />

      <RejectReasonModal
        open={Boolean(rejectIds)}
        studentName={rejectSubject}
        busy={isPending}
        onClose={() => setRejectIds(null)}
        onConfirm={doReject}
      />
      <FlagReviewGate
        open={Boolean(gate)}
        flagReason={gate?.reason ?? ""}
        subject={gate?.subject ?? ""}
        count={gate?.ids.length}
        busy={isPending}
        onConfirm={() => {
          if (gate) doApprove(gate.ids);
          setGate(null);
        }}
        onCancel={() => setGate(null)}
      />
    </div>
  );
}
