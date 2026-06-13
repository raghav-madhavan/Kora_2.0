"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { FlagReviewGate } from "@/components/moderator/flag-review-gate";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { RejectReasonModal } from "@/components/moderator/reject-reason-modal";
import { useToast } from "@/components/student/toast-provider";
import type { OrgShiftLog } from "@/lib/types/moderator";

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

/**
 * Flat (non-card) review row for the dashboard "Needs review" list. Inline
 * approve + reject keep the lead moderator clearing the queue without leaving
 * the dashboard; flagged claims still pass through the FlagReviewGate.
 */
export function DashboardReviewItem({
  log,
  className = "",
}: {
  log: OrgShiftLog;
  className?: string;
}) {
  const { approve, reject } = useOrgLogs();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  function runApprove() {
    startTransition(async () => {
      try {
        await approve(log.id);
        toast.success(`Hours approved for ${log.studentName}`);
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

  return (
    <li className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={log.studentAvatar}
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl bg-accent-lavender object-cover"
      />
      <Link
        href={`/moderator/verifications/${log.id}`}
        className="min-w-0 flex-1"
      >
        <p className="flex items-center gap-1.5 truncate text-[15px] font-bold transition hover:text-primary">
          {log.studentName}
          {log.status === "flagged" ? (
            <>
              <AlertTriangle
                size={14}
                strokeWidth={2.4}
                className="shrink-0 text-flagged"
                aria-hidden
              />
              <span className="sr-only">Flagged claim</span>
            </>
          ) : null}
        </p>
        <p className="truncate text-[12px] text-muted">
          {log.shiftTitle} · {log.date}
        </p>
      </Link>
      <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums">
        {formatHours(log.hours)} hrs
      </span>
      <button
        type="button"
        onClick={handleApproveClick}
        disabled={isPending}
        className="flex shrink-0 items-center gap-1.5 rounded-pill bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.97] disabled:opacity-60"
      >
        <Check size={14} strokeWidth={2.6} />
        Approve
      </button>
      <button
        type="button"
        onClick={() => setRejectOpen(true)}
        disabled={isPending}
        aria-label={`Reject ${log.studentName}'s claim`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-danger transition hover:bg-danger/10 active:scale-[0.97] disabled:opacity-60"
      >
        <X size={15} strokeWidth={2.6} />
      </button>

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
    </li>
  );
}
