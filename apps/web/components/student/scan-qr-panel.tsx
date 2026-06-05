"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, KeyRound } from "lucide-react";
import { scanShiftQr } from "@/app/(student)/scan/actions";

interface ScanQrPanelProps {
  demoToken?: string;
}

export function ScanQrPanel({ demoToken }: ScanQrPanelProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    shiftTitle: string;
    org: string;
    hours: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await scanShiftQr(code);
        setSuccess({
          shiftTitle: result.shiftTitle,
          org: result.org,
          hours: result.hours,
        });
        setCode("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Check-in failed");
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-surface p-6 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-sky">
          <BadgeCheck size={28} className="text-success" strokeWidth={2.4} />
        </div>
        <h3 className="text-[20px] font-bold">Hours logged & verified</h3>
        <p className="mt-2 text-[14px] text-muted">
          {success.shiftTitle} · {success.org}
        </p>
        <p className="mt-1 text-[20px] font-bold text-primary">
          +{success.hours} hrs
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/hours")}
            className="rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
          >
            View My Hours
          </button>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Check in another shift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-lavender">
          <KeyRound size={20} className="text-primary" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-[16px] font-bold">Enter check-in code</h3>
          <p className="text-[13px] text-muted">
            Type the code your moderator displays at the end of your shift.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="check-in-code"
          className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-muted"
        >
          Check-in code
        </label>
        <input
          id="check-in-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste or type the code from your moderator"
          className="w-full rounded-xl border border-black/10 bg-canvas px-4 py-3 text-[14px] placeholder:text-muted focus:border-primary focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />

        {error ? (
          <p className="mt-3 text-[13px] font-medium text-flagged">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="mt-4 w-full rounded-pill bg-primary py-3 text-[15px] font-semibold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}
