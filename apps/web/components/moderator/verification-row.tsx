"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  QrCode,
  XCircle,
} from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
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

export function VerificationRow({ log }: { log: OrgShiftLog }) {
  const { approve } = useOrgLogs();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const tintStyle = tints[log.categoryTint];
  const canQuickApprove =
    log.status === "pending" || log.status === "flagged";

  const handleApprove = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      try {
        await approve(log.id);
        toast.success(`${log.studentName}'s hours approved`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not approve hours";
        toast.error(message);
      }
    });
  };

  return (
    <Link
      href={`/moderator/verifications/${log.id}`}
      className="block rounded-card bg-surface p-5 shadow-card transition hover:shadow-raised"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={log.studentAvatar}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl bg-accent-lavender object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{log.studentName}</p>
            <p className="truncate text-[12px] text-muted">{log.school}</p>
          </div>
        </div>

        <div className="min-w-0 sm:w-[30%]">
          <p className="truncate text-[14px] font-semibold">{log.shiftTitle}</p>
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

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-pill px-3 py-1 text-[12px] font-semibold ${tintStyle.bg} ${tintStyle.fg}`}
          >
            {log.category}
          </span>
          <span className="font-mono text-[14px] font-semibold">
            {formatHours(log.hours)} hrs
          </span>
          <LogStatusChip status={log.status} />
          {canQuickApprove ? (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
            >
              <Check size={14} strokeWidth={2.6} />
              Approve
            </button>
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

      {log.status === "flagged" && log.flagReason ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-flagged/10 px-4 py-3">
          <AlertTriangle
            size={16}
            strokeWidth={2.4}
            className="mt-0.5 shrink-0 text-flagged"
          />
          <p className="text-[13px] font-medium text-flagged">
            {log.flagReason}
          </p>
        </div>
      ) : null}

      {log.status === "rejected" && log.rejectReason ? (
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
    </Link>
  );
}
