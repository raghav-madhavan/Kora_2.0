"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ExternalLink,
  FileClock,
  QrCode,
  X,
  XCircle,
} from "lucide-react";
import { FlagReviewGate } from "@/components/moderator/flag-review-gate";
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
import type {
  ModeratorAuditEntry,
  OrgShiftLog,
} from "@/lib/types/moderator";

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

interface VerificationDetailProps {
  initialLog: OrgShiftLog;
  /** Compact, back-link-free layout for the split-pane. */
  embedded?: boolean;
  /** Server-fetched audit trail (full page only). */
  auditEntries?: ModeratorAuditEntry[];
}

export function VerificationDetail({
  initialLog,
  embedded = false,
  auditEntries,
}: VerificationDetailProps) {
  const { logs, approve, reject } = useOrgLogs();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const log = logs.find((l) => l.id === initialLog.id) ?? initialLog;
  const status = orgLogStatusConfig[log.status];
  const StatusIcon = status.icon;
  const tint = tints[log.categoryTint];
  const timeline = getOrgLogTimelineSteps(log);
  const reviewable = log.status === "pending" || log.status === "flagged";
  const decidedById = log.verifiedByModeratorId ?? log.rejectedByModeratorId;

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

  const showDecisionRecord =
    Boolean(log.decidedAt) || (auditEntries?.length ?? 0) > 0;

  return (
    <div>
      {!embedded ? (
        <Link
          href="/moderator/verifications"
          className="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Verifications
        </Link>
      ) : null}

      <div
        className={`mb-6 rounded-card shadow-card ${embedded ? "p-5" : "p-6 sm:p-8"}`}
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
        <p
          className={`mt-4 font-display font-semibold leading-none tracking-tight tabular-nums ${
            embedded ? "text-[28px]" : "text-[36px]"
          }`}
        >
          {formatHours(log.hours)} hrs
        </p>
        <h1 className={`mt-3 font-bold ${embedded ? "text-[18px]" : "text-[22px]"}`}>
          {log.shiftTitle}
        </h1>
        <p className="mt-2 text-[15px] text-ink/80">
          {log.studentName} · {log.date}
        </p>
      </div>

      <div
        className={
          embedded
            ? "flex flex-col gap-6"
            : "grid grid-cols-1 gap-6 lg:grid-cols-2"
        }
      >
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
                onClick={handleApproveClick}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.97] disabled:opacity-60"
              >
                <Check size={15} strokeWidth={2.6} />
                {isPending ? "Working…" : "Approve hours"}
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-pill px-5 py-2.5 text-[14px] font-semibold text-danger transition hover:bg-danger/10 active:scale-[0.97] disabled:opacity-60"
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

        {showDecisionRecord ? (
          <section className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-[18px] font-bold">
              <FileClock size={18} strokeWidth={2.2} className="text-muted" />
              Decision record
            </h2>
            <dl className="mt-4 space-y-2 text-[13px]">
              {log.decidedAt ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Decided</dt>
                  <dd className="font-semibold">
                    {formatOrgLogDateTime(log.decidedAt)}
                  </dd>
                </div>
              ) : null}
              {decidedById ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Moderator</dt>
                  <dd className="font-mono text-[12px] font-semibold">
                    {decidedById}
                  </dd>
                </div>
              ) : null}
            </dl>

            {auditEntries && auditEntries.length > 0 ? (
              <ul className="mt-4 space-y-3 border-t border-black/5 pt-4">
                {auditEntries.map((entry) => (
                  <li key={entry.id} className="text-[13px]">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`font-semibold ${
                          entry.action === "approve"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {entry.action === "approve" ? "Approved" : "Rejected"}
                      </span>
                      <span className="text-muted">
                        {formatOrgLogDateTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      {entry.moderatorId}
                    </p>
                    {entry.reason ? (
                      <p className="mt-1 text-muted">“{entry.reason}”</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {!embedded ? (
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
        ) : null}
      </div>

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
