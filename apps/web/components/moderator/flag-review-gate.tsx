"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";

interface FlagReviewGateProps {
  open: boolean;
  /** The fraud-hold reason(s) the moderator is overriding. */
  flagReason: string;
  /** Headline subject, e.g. a student name or "3 claims". */
  subject: string;
  /** When approving a cluster, the number of claims being released. */
  count?: number;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation gate for approving a fraud-held claim. Forces an explicit
 * "I reviewed this flag" acknowledgement before a flagged claim can be
 * approved, so a one-click approve can never silently override a hold.
 */
export function FlagReviewGate({
  open,
  flagReason,
  subject,
  count,
  busy,
  onConfirm,
  onCancel,
}: FlagReviewGateProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!open) setAcknowledged(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const label =
    count && count > 1 ? `Approve ${count} flagged claims` : "Approve anyway";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-gate-title"
        className="w-full max-w-md rounded-card bg-surface p-6 shadow-raised"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-flagged/10 text-flagged">
              <AlertTriangle size={20} strokeWidth={2.4} />
            </span>
            <div>
              <h2 id="flag-gate-title" className="text-[20px] font-bold">
                Override a fraud hold
              </h2>
              <p className="mt-1 text-[14px] text-muted">
                {subject} {count && count > 1 ? "were" : "was"} held for review.
                Confirm you&apos;ve looked before approving.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink"
            aria-label="Cancel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl bg-flagged/10 px-4 py-3">
          <AlertTriangle
            size={16}
            strokeWidth={2.4}
            className="mt-0.5 shrink-0 text-flagged"
          />
          <p className="text-[13px] font-medium text-flagged">{flagReason}</p>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-canvas px-4 py-3 text-[14px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          I reviewed this flag and these hours are legitimate
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!acknowledged || busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
          >
            <Check size={15} strokeWidth={2.6} />
            {busy ? "Working…" : label}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-pill bg-accent-lavender px-5 py-3 text-[14px] font-semibold text-ink transition hover:bg-canvas"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
