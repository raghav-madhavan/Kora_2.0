"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ExternalLink,
  QrCode,
  X,
  XCircle,
} from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { RejectReasonModal } from "@/components/moderator/reject-reason-modal";
import { orgLogStatusConfig } from "@/components/moderator/verification-row";
import { useToast } from "@/components/student/toast-provider";
import { tints } from "@/lib/mock-data";
import {
  formatOrgLogDateTime,
  getOrgLogHeroGradient,
  getOrgLogTimelineSteps,
} from "@/lib/verifications";
import type { OrgShiftLog } from "@/lib/types/moderator";

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function VerificationDetail({ initialLog }: { initialLog: OrgShiftLog }) {
  const { logs, approve, reject } = useOrgLogs();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);

  const log = logs.find((l) => l.id === initialLog.id) ?? initialLog;
  const status = orgLogStatusConfig[log.status];
  const StatusIcon = status.icon;
  const tint = tints[log.categoryTint];
  const timeline = getOrgLogTimelineSteps(log);
  const reviewable = log.status === "pending" || log.status === "flagged";

  function handleApprove() {
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
    <div>
      <Link
        href="/moderator/verifications"
        className="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Verifications
      </Link>

      <div
        className="mb-6 rounded-card p-6 shadow-card sm:p-8"
        style={{ background: getOrgLogHeroGradient(log.status) }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-pill bg-white/70 px-3 py-1 text-[13px] font-semibold ${status.className}`}
          >
            <StatusIcon size={16} strokeWidth={2.2} />
            {status.label}
          </span>
          <span
            className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
          >
            {log.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/70 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink/70">
            {log.method === "qr" ? (
              <>
                <QrCode size={13} strokeWidth={2.4} />
                QR check-in
              </>
            ) : (
              "Manual claim"
            )}
          </span>
        </div>
        <p className="mt-4 font-display text-[36px] font-semibold leading-none tracking-tight">
          {formatHours(log.hours)} hrs
        </p>
        <h1 className="mt-3 text-[22px] font-bold">{log.shiftTitle}</h1>
        <p className="mt-2 text-[15px] text-ink/80">
          {log.studentName} · {log.date}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="text-[18px] font-bold">Claim</h2>

          <div className="mt-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={log.studentAvatar}
              alt={log.studentName}
              className="h-12 w-12 shrink-0 rounded-xl bg-accent-lavender object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold">
                {log.studentName}
              </p>
              <p className="truncate text-[13px] text-muted">{log.school}</p>
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

          {log.status === "verified" ? (
            <p className="mt-4 text-[14px] text-muted">
              Verified on {formatOrgLogDateTime(log.verifiedAt)}. These hours
              now count toward {log.studentName.split(" ")[0]}&apos;s
              requirements.
            </p>
          ) : null}

          {reviewable ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
              >
                <Check size={15} strokeWidth={2.6} />
                {isPending ? "Working…" : "Approve hours"}
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-pill px-5 py-2.5 text-[14px] font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
              >
                <X size={15} strokeWidth={2.6} />
                Reject
              </button>
            </div>
          ) : null}

          <Link
            href={`/moderator/shifts/${log.shiftId}`}
            className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline"
          >
            View related shift
            <ExternalLink size={15} />
          </Link>
        </section>

        <section className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="text-[18px] font-bold">Timeline</h2>
          <ol className="mt-6 space-y-0">
            {timeline.map((step, index) => (
              <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < timeline.length - 1 ? (
                  <span
                    className={`absolute left-[11px] top-6 h-full w-px ${
                      step.complete ? "bg-primary/40" : "bg-black/10"
                    }`}
                  />
                ) : null}
                <span
                  className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${
                    step.complete
                      ? "border-primary bg-primary"
                      : "border-black/15 bg-canvas"
                  }`}
                />
                <div>
                  <p className="text-[14px] font-bold">{step.label}</p>
                  <p className="mt-1 text-[13px] text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <RejectReasonModal
        open={rejectOpen}
        studentName={log.studentName}
        busy={isPending}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
}
