"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { QrDisplayPanel } from "@/components/moderator/qr-display-panel";
import { ShiftOpsBar } from "@/components/moderator/shift-ops-bar";
import { VerificationRow } from "@/components/moderator/verification-row";
import type { ModeratorShift } from "@/lib/types/moderator";

interface ShiftDetailClientProps {
  shift: ModeratorShift;
  qrSession: { token: string; expiresAt: string } | null;
}

type ClaimTab = "pending" | "all";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function ShiftDetailClient({ shift, qrSession }: ShiftDetailClientProps) {
  const { logs } = useOrgLogs();
  const isMobile = useIsMobile();
  const shiftLogs = useMemo(
    () => logs.filter((log) => log.shiftId === shift.id),
    [logs, shift.id],
  );
  const upcoming = shift.status === "upcoming";
  const hasQr = upcoming && Boolean(qrSession);

  const pendingLogs = useMemo(
    () =>
      shiftLogs.filter(
        (log) => log.status === "pending" || log.status === "flagged",
      ),
    [shiftLogs],
  );

  const [claimTab, setClaimTab] = useState<ClaimTab>(() =>
    pendingLogs.length > 0 ? "pending" : "all",
  );
  // Collapse the QR hero when there are claims waiting, so triage stays in view.
  const [qrCollapsed, setQrCollapsed] = useState(() => pendingLogs.length > 0);

  const visibleClaims = claimTab === "pending" ? pendingLogs : shiftLogs;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/moderator/shifts"
        className="inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
      >
        <ArrowLeft size={16} strokeWidth={2.4} />
        All shifts
      </Link>

      <ShiftOpsBar
        shiftId={shift.id}
        showQrToggle={hasQr}
        qrCollapsed={qrCollapsed}
        onToggleQr={() => setQrCollapsed((prev) => !prev)}
      />

      {/* Hero summary */}
      <section className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="relative h-44 sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shift.img}
            alt={shift.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute right-4 top-4 rounded-pill bg-panel/85 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
            {upcoming ? "Upcoming" : "Completed"}
          </span>
        </div>
        <div className="p-6">
          <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight">
            {shift.title}
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] text-muted">
            {shift.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
            <p className="flex items-center gap-2">
              <CalendarDays size={15} strokeWidth={2.2} className="shrink-0" />
              {shift.date}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} strokeWidth={2.2} className="shrink-0" />
              {shift.location}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 size={15} strokeWidth={2.2} className="shrink-0" />
              {shift.hours} hrs credit
            </p>
            <p className="flex items-center gap-2 font-mono text-[12px] tabular-nums">
              <Users size={15} strokeWidth={2.2} className="shrink-0" />
              {upcoming
                ? `${shift.committedCount}/${shift.slots} slots committed`
                : `${shift.checkedInCount}/${shift.committedCount} checked in`}
            </p>
          </div>
        </div>
      </section>

      {/* QR panel — upcoming shifts only, collapsible during triage */}
      {hasQr && qrSession && !qrCollapsed ? (
        <QrDisplayPanel
          shiftId={shift.id}
          shiftTitle={shift.title}
          initialToken={qrSession.token}
          initialExpiresAt={qrSession.expiresAt}
        />
      ) : null}

      {/* Hour claims for this shift */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-[20px] font-semibold tracking-tight">
            Hour claims
          </h3>
          {shiftLogs.length > 0 ? (
            <div className="flex gap-2" role="tablist" aria-label="Claim filter">
              <FilterChip
                role="tab"
                aria-selected={claimTab === "pending"}
                active={claimTab === "pending"}
                count={pendingLogs.length}
                onClick={() => setClaimTab("pending")}
              >
                Pending
              </FilterChip>
              <FilterChip
                role="tab"
                aria-selected={claimTab === "all"}
                active={claimTab === "all"}
                count={shiftLogs.length}
                onClick={() => setClaimTab("all")}
              >
                All
              </FilterChip>
            </div>
          ) : null}
        </div>

        {visibleClaims.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title={claimTab === "pending" ? "Nothing to review" : "No claims yet"}
            body={
              claimTab === "pending"
                ? "Every claim for this shift has been reviewed."
                : upcoming
                  ? "Claims will appear after students check in at this shift."
                  : "No students submitted hours for this shift."
            }
            iconClassName={claimTab === "pending" ? "text-success" : undefined}
          />
        ) : (
          <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-4"}`}>
            {visibleClaims.map((log) => (
              <VerificationRow key={log.id} log={log} compact={isMobile} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
