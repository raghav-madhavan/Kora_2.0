"use client";

import { useState } from "react";
import { KeyRound, QrCode, X } from "lucide-react";

interface CheckInScannerProps {
  code: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
  demoToken?: string;
}

export function CheckInScanner({
  code,
  onChange,
  onSubmit,
  isPending,
  error,
  demoToken,
}: CheckInScannerProps) {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl bg-surface p-4 shadow-card sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-lavender">
            <KeyRound size={22} className="text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold">Check-in code</h3>
            <p className="text-[14px] text-muted">
              Enter the code your moderator displays at the end of your shift.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-pill border-2 border-dashed border-primary/30 bg-accent-lavender/40 py-4 text-[15px] font-semibold text-primary transition hover:border-primary hover:bg-accent-lavender"
        >
          <QrCode size={20} strokeWidth={2.2} />
          Scan QR code
        </button>

        <form onSubmit={onSubmit}>
          <label
            htmlFor="check-in-code"
            className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-muted"
          >
            Check-in code
          </label>
          <input
            id="check-in-code"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste or type the code from your moderator"
            className="w-full rounded-xl border border-black/10 bg-canvas px-4 py-3.5 text-[15px] placeholder:text-muted focus:border-primary focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />

          {error ? (
            <p className="mt-3 text-[13px] font-medium text-flagged">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isPending || !code.trim()}
            className="mt-4 w-full rounded-pill bg-primary py-3.5 text-[15px] font-semibold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Verifying…" : "Log & Verify Hours"}
          </button>
        </form>

        {demoToken ? (
          <p className="mt-4 rounded-xl bg-canvas px-4 py-3 text-[11px] text-muted">
            <span className="font-semibold text-ink">Demo:</span> after committing
            to Hope Community Kitchen, use{" "}
            <code className="break-all text-primary">{demoToken}</code>
          </p>
        ) : null}
      </div>

      {scannerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanner-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-raised">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="scanner-title" className="text-[18px] font-bold">
                Scan QR code
              </h3>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink"
                aria-label="Close scanner"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-ink/90">
              <div className="absolute inset-8 rounded-xl border-2 border-white/40" />
              <QrCode size={48} className="text-white/30" strokeWidth={1.5} />
            </div>

            <p className="text-center text-[14px] text-muted">
              Camera scanning coming soon — paste code below
            </p>

            <button
              type="button"
              onClick={() => setScannerOpen(false)}
              className="mt-4 w-full rounded-pill bg-primary py-3 text-[15px] font-semibold text-white transition hover:bg-primary-deep"
            >
              Enter code manually
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
