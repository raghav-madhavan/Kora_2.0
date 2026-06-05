"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import { requestQrToken } from "@/app/(student)/log-hours/actions";

interface GenerateQrButtonProps {
  shiftLogId: string;
  label?: string;
}

export function GenerateQrButton({
  shiftLogId,
  label = "Generate QR",
}: GenerateQrButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        await requestQrToken(shiftLogId);
        router.push(`/log-hours/${shiftLogId}/qr`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate QR");
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-deep disabled:opacity-50"
      >
        <QrCode size={14} />
        {isPending ? "Generating…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-[12px] font-medium text-flagged">{error}</p>
      ) : null}
    </div>
  );
}
