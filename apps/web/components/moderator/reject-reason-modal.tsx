"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PRESET_REASONS = [
  "Hours don't match the shift schedule",
  "Student is not on the shift roster",
  "Duplicate of an existing claim",
] as const;

const OTHER = "other";

interface RejectReasonModalProps {
  open: boolean;
  studentName: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectReasonModal({
  open,
  studentName,
  busy,
  onClose,
  onConfirm,
}: RejectReasonModalProps) {
  const [selected, setSelected] = useState<string>(PRESET_REASONS[0]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      setSelected(PRESET_REASONS[0]);
      setNote("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const isOther = selected === OTHER;
  const reason = isOther ? note.trim() : selected;
  const canConfirm = reason.length > 0 && !busy;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-reason-title"
        className="w-full max-w-md rounded-card bg-surface p-6 shadow-raised"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="reject-reason-title" className="text-[20px] font-bold">
              Reject claim
            </h2>
            <p className="mt-1 text-[14px] text-muted">
              {studentName} will see the reason you choose.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Rejection reason</legend>
          {[...PRESET_REASONS, OTHER].map((value) => {
            const label = value === OTHER ? "Other reason" : value;
            const active = selected === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-colors duration-200 ${
                  active
                    ? "bg-panel text-cream"
                    : "bg-canvas text-ink hover:bg-accent-lavender"
                }`}
              >
                <input
                  type="radio"
                  name="reject-reason"
                  value={value}
                  checked={active}
                  onChange={() => setSelected(value)}
                  className="h-4 w-4 accent-primary"
                />
                {label}
              </label>
            );
          })}
        </fieldset>

        {isOther ? (
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Explain why these hours can't be verified"
            className="mt-3 w-full resize-none rounded-2xl bg-canvas px-4 py-3 text-[14px] outline-none ring-primary/40 placeholder:text-muted focus:ring-2"
          />
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={!canConfirm}
            className="inline-flex flex-1 items-center justify-center rounded-pill bg-danger px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-danger/85 disabled:opacity-60"
          >
            {busy ? "Rejecting…" : "Reject claim"}
          </button>
          <button
            type="button"
            onClick={onClose}
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
