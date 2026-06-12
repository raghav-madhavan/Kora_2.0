"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { scanShiftQr } from "@/app/(student)/scan/actions";
import { CheckInScanner } from "@/components/student/check-in-scanner";
import { useHours } from "@/components/student/hours-provider";
import { useToast } from "@/components/student/toast-provider";

interface ScanQrPanelProps {
  demoToken?: string;
}

export function ScanQrPanel({ demoToken }: ScanQrPanelProps) {
  const router = useRouter();
  const { appendLog } = useHours();
  const toast = useToast();
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
        appendLog(result.shiftLog);
        toast.success(`Check-in recorded for ${result.shiftTitle} — pending approval`);
        setSuccess({
          shiftTitle: result.shiftTitle,
          org: result.org,
          hours: result.hours,
        });
        setCode("");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Check-in failed";
        setError(message);
        toast.error(message);
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-surface p-6 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-sky">
          <BadgeCheck size={28} className="text-success" strokeWidth={2.4} />
        </div>
        <h3 className="text-[20px] font-bold">Check-in recorded</h3>
        <p className="mt-2 text-[14px] text-muted">
          {success.shiftTitle} · {success.org}
        </p>
        <p className="mt-1 text-[15px] font-medium text-pending">
          Pending moderator approval
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
    <CheckInScanner
      code={code}
      onChange={setCode}
      onSubmit={handleSubmit}
      isPending={isPending}
      error={error}
      demoToken={demoToken}
    />
  );
}
