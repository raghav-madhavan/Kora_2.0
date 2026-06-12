"use client";

import Link from "next/link";
import { logStatusConfig } from "@/lib/log-status";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import {
  formatLogDateTime,
  getLogHeroGradient,
  getLogTimelineSteps,
  getModeratorForLog,
} from "@/lib/hours";
import { tints } from "@/lib/mock-data";
import type { ShiftLog } from "@/lib/types/student";

interface HourLogDetailProps {
  log: ShiftLog;
}

export function HourLogDetail({ log }: HourLogDetailProps) {
  const tint = tints[log.categoryTint];
  const status = logStatusConfig[log.status];
  const StatusIcon = status.icon;
  const moderator = getModeratorForLog(log);
  const timeline = getLogTimelineSteps(log);

  return (
    <div>
      <Link
        href="/hours"
        className="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to My Hours
      </Link>

      <div
        className="mb-6 rounded-card p-6 shadow-card sm:p-8"
        style={{ background: getLogHeroGradient(log.status) }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-pill bg-white/70 px-3 py-1 text-[13px] font-semibold ${status.className}`}
          >
            <StatusIcon size={16} />
            {status.label}
          </span>
          <span
            className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
          >
            {log.category}
          </span>
        </div>
        <p className="mt-4 font-display text-[36px] font-semibold leading-none tracking-tight tabular-nums">
          +{log.hours} hrs
        </p>
        <h1 className="mt-3 text-[22px] font-bold">{log.activity}</h1>
        <p className="mt-2 text-[15px] text-ink/80">
          {log.org} · {log.date}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="text-[18px] font-bold">Verification</h2>
          {log.status === "verified" && moderator ? (
            <div className="mt-4">
              <ModeratorRow moderator={moderator} />
              <p className="mt-3 text-[14px] text-muted">
                Verified on {formatLogDateTime(log.verifiedAt)}
              </p>
            </div>
          ) : null}
          {log.status === "pending" ? (
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Your hours are waiting for moderator approval. Only verified hours
              count toward graduation and Bright Futures requirements.
            </p>
          ) : null}
          {log.status === "flagged" ? (
            <div className="mt-4">
              <p className="text-[15px] leading-relaxed text-ink/85">
                {log.flagReason ??
                  "This entry was flagged for review. Contact your school counselor for next steps."}
              </p>
              <Link
                href="/messages"
                className="mt-4 inline-flex items-center gap-2 rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Contact counselor
              </Link>
            </div>
          ) : null}
          {log.status === "rejected" ? (
            <div className="mt-4">
              <p className="text-[15px] leading-relaxed text-ink/85">
                {log.rejectReason ??
                  "These hours were not approved. Contact your org moderator if you think this was a mistake."}
              </p>
              <Link
                href="/messages"
                className="mt-4 inline-flex items-center gap-2 rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Message moderator
              </Link>
            </div>
          ) : null}

          <Link
            href={`/events/${log.shiftId}`}
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
    </div>
  );
}
