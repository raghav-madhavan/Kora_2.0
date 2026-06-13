"use client";

import Link from "next/link";
import { ChevronsDownUp, ChevronsUpDown, ClipboardCheck } from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";

interface ShiftOpsBarProps {
  shiftId: string;
  /** Show the QR collapse toggle (only when a QR panel is present). */
  showQrToggle: boolean;
  qrCollapsed: boolean;
  onToggleQr: () => void;
}

/**
 * Sticky shift-ops HUD for the shift detail page. Lets a shift lead run QR
 * display and verification triage from one screen at event velocity — pending
 * count, a deep link into the scoped queue, and a QR collapse toggle.
 */
export function ShiftOpsBar({
  shiftId,
  showQrToggle,
  qrCollapsed,
  onToggleQr,
}: ShiftOpsBarProps) {
  const { logs } = useOrgLogs();
  const pendingCount = logs.filter(
    (log) =>
      log.shiftId === shiftId &&
      (log.status === "pending" || log.status === "flagged"),
  ).length;

  return (
    <div className="sticky top-2 z-20 flex items-center gap-3 rounded-card bg-surface/95 px-4 py-3 shadow-card backdrop-blur">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
          pendingCount > 0
            ? "bg-pending/15 text-pending"
            : "bg-success/10 text-success"
        }`}
      >
        <ClipboardCheck size={18} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold leading-tight">
          {pendingCount > 0 ? (
            <>
              <span className="tabular-nums">{pendingCount}</span> claim
              {pendingCount === 1 ? "" : "s"} to review
            </>
          ) : (
            "No claims waiting"
          )}
        </p>
        <p className="text-[12px] text-muted">This shift</p>
      </div>

      {pendingCount > 0 ? (
        <Link
          href={`/moderator/verifications?shift=${shiftId}&status=pending&sort=oldest`}
          className="shrink-0 rounded-pill bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.97]"
        >
          Review pending
        </Link>
      ) : null}

      {showQrToggle ? (
        <button
          type="button"
          onClick={onToggleQr}
          aria-expanded={!qrCollapsed}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-canvas px-3 py-2 text-[13px] font-semibold text-ink transition hover:bg-accent-lavender active:scale-[0.97]"
        >
          {qrCollapsed ? (
            <ChevronsUpDown size={15} strokeWidth={2.2} />
          ) : (
            <ChevronsDownUp size={15} strokeWidth={2.2} />
          )}
          {qrCollapsed ? "Show QR" : "Hide QR"}
        </button>
      ) : null}
    </div>
  );
}
