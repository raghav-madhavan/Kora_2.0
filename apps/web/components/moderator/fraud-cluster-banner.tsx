"use client";

import { useState } from "react";
import { Check, ChevronDown, ShieldAlert, X } from "lucide-react";
import type { FraudCluster } from "@/lib/verifications";

interface FraudClusterBannerProps {
  clusters: FraudCluster[];
  onSelectCluster: (logIds: string[]) => void;
  onApproveCluster: (cluster: FraudCluster) => void;
  onRejectCluster: (cluster: FraudCluster) => void;
  busy: boolean;
  defaultExpanded?: boolean;
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

/**
 * Fraud-cluster mitigation banner. Renders when flagged claims form a cluster
 * (3+ identical unverified hours on one shift). Lets a moderator triage the
 * whole cluster in one move instead of claim-by-claim.
 */
export function FraudClusterBanner({
  clusters,
  onSelectCluster,
  onApproveCluster,
  onRejectCluster,
  busy,
  defaultExpanded = false,
}: FraudClusterBannerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (clusters.length === 0) return null;

  const totalClaims = clusters.reduce((sum, c) => sum + c.logs.length, 0);

  return (
    <section
      aria-label="Fraud clusters"
      className="mb-4 rounded-card border border-flagged/20 bg-flagged/5 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-flagged/10 text-flagged">
          <ShieldAlert size={20} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-flagged">
            {clusters.length === 1
              ? "Possible fraud cluster detected"
              : `${clusters.length} possible fraud clusters detected`}
          </p>
          <p className="mt-0.5 text-[13px] text-ink/70">
            <span className="tabular-nums">{totalClaims}</span> flagged claims
            share identical hours on the same shift. Review and decide together.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-flagged transition hover:bg-flagged/10"
          aria-label={expanded ? "Hide cluster details" : "Show cluster details"}
        >
          <ChevronDown
            size={18}
            strokeWidth={2.4}
            className={expanded ? "rotate-180" : ""}
          />
        </button>
      </div>

      {expanded ? (
        <ul className="mt-3 flex flex-col gap-2">
          {clusters.map((cluster) => (
            <li
              key={cluster.key}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">
                  {cluster.shiftTitle}
                </p>
                <p className="text-[12px] text-muted">
                  <span className="tabular-nums">{cluster.logs.length}</span>{" "}
                  students ·{" "}
                  <span className="font-mono tabular-nums">
                    {formatHours(cluster.hours)} hrs
                  </span>{" "}
                  each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCluster(cluster.logIds)}
                  disabled={busy}
                  className="rounded-pill bg-canvas px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-accent-lavender active:scale-[0.97] disabled:opacity-60"
                >
                  Select {cluster.logs.length}
                </button>
                <button
                  type="button"
                  onClick={() => onRejectCluster(cluster)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-danger px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-danger/85 active:scale-[0.97] disabled:opacity-60"
                >
                  <X size={13} strokeWidth={2.6} />
                  Reject all
                </button>
                <button
                  type="button"
                  onClick={() => onApproveCluster(cluster)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-black/10 px-3 py-1.5 text-[12px] font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.97] disabled:opacity-60"
                >
                  <Check size={13} strokeWidth={2.6} />
                  Approve all
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
