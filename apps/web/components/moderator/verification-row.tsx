"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertTriangle, ArrowUpRight, Check, QrCode, X, XCircle } from "lucide-react";
import { FlagReviewGate } from "@/components/moderator/flag-review-gate";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { RejectReasonModal } from "@/components/moderator/reject-reason-modal";
import { useToast } from "@/components/student/toast-provider";
import { tints } from "@/lib/mock-data";
import { logStatusConfig } from "@/lib/log-status";
import { LogStatusChip } from "@/components/shared/log-status-chip";
import type { OrgShiftLog } from "@/lib/types/moderator";

/** @deprecated Use logStatusConfig from @/lib/log-status */
export const orgLogStatusConfig = logStatusConfig;

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

interface VerificationRowProps {
  log: OrgShiftLog;
  /** Dense single-line variant for high-volume queue triage. */
  compact?: boolean;
  /** Show a selection checkbox (queue console batch mode). */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (logId: string) => void;
  /** Split-pane highlight for the currently open claim. */
  active?: boolean;
  /**
   * Open handler for the row body. When provided (split-pane), clicking selects
   * the claim instead of navigating. Otherwise the body links to the detail page.
   */
  onOpen?: (logId: string) => void;
}

export function VerificationRow({
  log,
  compact = false,
  selectable = false,
  selected = false,
  onSelect,
  active = false,
  onOpen,
}: VerificationRowProps) {
  const { approve, reject } = useOrgLogs();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const tintStyle = tints[log.categoryTint];
  const reviewable = log.status === "pending" || log.status === "flagged";

  function runApprove() {
    startTransition(async () => {
      try {
        await approve(log.id);
        toast.success(`${log.studentName}'s hours approved`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not approve hours",
        );
      }
    });
  }

  function handleApproveClick() {
    if (log.status === "flagged") {
      setGateOpen(true);
      return;
    }
    runApprove();
  }

  function handleReject(reason: string) {
    startTransition(async () => {
      try {
        await reject(log.id, reason);
        setRejectOpen(false);
        toast.success(`Claim rejected for ${log.studentName}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not reject claim",
        );
      }
    });
  }

  const bodyClass = "flex min-w-0 flex-1 items-center gap-3 text-left";
  const avatarClass = compact
    ? "h-9 w-9 shrink-0 rounded-lg bg-accent-lavender object-cover"
    : "h-11 w-11 shrink-0 rounded-xl bg-accent-lavender object-cover";

  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={log.studentAvatar} alt="" className={avatarClass} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[15px] font-bold">
          <span className="truncate">{log.studentName}</span>
          {log.status === "flagged" ? (
            <AlertTriangle
              size={14}
              strokeWidth={2.4}
              className="shrink-0 text-flagged"
              aria-label="Flagged"
            />
          ) : null}
        </p>
        {compact ? (
          <p className="truncate text-[12px] text-muted">{log.shiftTitle}</p>
        ) : (
          <p className="truncate text-[12px] text-muted">{log.school}</p>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`rounded-card bg-surface shadow-card transition-shadow duration-150 ${
        compact ? "px-4 py-2.5" : "p-5"
      } ${
        active
          ? "outline outline-2 -outline-offset-2 outline-primary/60"
          : "hover:shadow-raised"
      }`}
      aria-current={active ? "true" : undefined}
    >
      <div className="flex items-center gap-3">
        {selectable ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect?.(log.id)}
            aria-label={`Select ${log.studentName}'s claim`}
            className="h-[18px] w-[18px] shrink-0 accent-primary"
          />
        ) : null}

        {onOpen ? (
          <button type="button" onClick={() => onOpen(log.id)} className={bodyClass}>
            {body}
          </button>
        ) : (
          <Link href={`/moderator/verifications/${log.id}`} className={bodyClass}>
            {body}
          </Link>
        )}

        {!compact ? (
          <div className="hidden min-w-0 sm:block sm:w-[26%]">
            <p className="truncate text-[14px] font-semibold">
              {log.shiftTitle}
            </p>
            <p className="flex items-center gap-1.5 text-[12px] text-muted">
              {log.date}
              <span aria-hidden>·</span>
              {log.method === "qr" ? (
                <span className="flex items-center gap-1">
                  <QrCode size={12} strokeWidth={2.4} />
                  QR check-in
                </span>
              ) : (
                "Manual claim"
              )}
            </p>
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-2.5">
          {!compact ? (
            <span
              className={`hidden rounded-pill px-3 py-1 text-[12px] font-semibold sm:inline ${tintStyle.bg} ${tintStyle.fg}`}
            >
              {log.category}
            </span>
          ) : null}
          <span className="font-mono text-[14px] font-semibold tabular-nums">
            {formatHours(log.hours)}
            <span className="text-muted"> hrs</span>
          </span>
          {!compact ? <LogStatusChip status={log.status} size="sm" /> : null}

          {reviewable ? (
            <>
              <button
                type="button"
                onClick={handleApproveClick}
                disabled={isPending}
                aria-label={`Approve ${log.studentName}'s hours`}
                className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.97] disabled:opacity-60"
              >
                <Check size={14} strokeWidth={2.6} />
                <span className={compact ? "sr-only" : ""}>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={isPending}
                aria-label={`Reject ${log.studentName}'s claim`}
                className="grid h-9 w-9 place-items-center rounded-full text-danger transition hover:bg-danger/10 active:scale-[0.97] disabled:opacity-60"
              >
                <X size={16} strokeWidth={2.6} />
              </button>
            </>
          ) : (
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-primary"
            >
              <ArrowUpRight size={17} strokeWidth={2.4} />
            </span>
          )}
        </div>
      </div>

      {!compact && log.status === "flagged" && log.flagReason ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-flagged/10 px-4 py-3">
          <AlertTriangle
            size={16}
            strokeWidth={2.4}
            className="mt-0.5 shrink-0 text-flagged"
          />
          <p className="text-[13px] font-medium text-flagged">{log.flagReason}</p>
        </div>
      ) : null}

      {!compact && log.status === "rejected" && log.rejectReason ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-canvas px-4 py-3">
          <XCircle
            size={16}
            strokeWidth={2.4}
            className="mt-0.5 shrink-0 text-muted"
          />
          <p className="text-[13px] font-medium text-muted">
            {log.rejectReason}
          </p>
        </div>
      ) : null}

      <RejectReasonModal
        open={rejectOpen}
        studentName={log.studentName}
        busy={isPending}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      <FlagReviewGate
        open={gateOpen}
        flagReason={log.flagReason ?? "Held for review per school policy."}
        subject={`${log.studentName}'s claim`}
        busy={isPending}
        onConfirm={() => {
          setGateOpen(false);
          runApprove();
        }}
        onCancel={() => setGateOpen(false)}
      />
    </div>
  );
}
