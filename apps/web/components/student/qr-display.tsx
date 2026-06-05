"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface QrDisplayProps {
  token: string;
  qrDataUrl: string;
  expiresAt: string;
  shiftTitle: string;
  org: string;
  hours: number;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function QrDisplay({
  token,
  qrDataUrl,
  expiresAt,
  shiftTitle,
  org,
  hours,
}: QrDisplayProps) {
  const [remaining, setRemaining] = useState(
    () => new Date(expiresAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const expired = remaining <= 0;

  return (
    <div className="mx-auto w-full max-w-md rounded-card bg-surface p-8 text-center shadow-card">
      <h1 className="text-[24px] font-bold">Show QR to Moderator</h1>
      <p className="mt-2 text-[14px] text-muted">
        {shiftTitle} · {org} · {hours} hrs
      </p>
      <p className="mt-1 text-[13px] text-muted">
        Show this code to your organization moderator for verification.
      </p>

      <div className="mt-8 flex justify-center">
        {expired ? (
          <div className="flex aspect-square w-[280px] items-center justify-center rounded-card border-2 border-dashed border-black/10 bg-canvas">
            <p className="px-4 text-[14px] font-medium text-flagged">
              QR code expired. Generate a new one from Log Hours.
            </p>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={qrDataUrl}
            alt="QR code for hour verification"
            width={280}
            height={280}
            className="rounded-card"
          />
        )}
      </div>

      {!expired ? (
        <p className="mt-4 text-[13px] font-semibold text-muted">
          Expires in {formatCountdown(remaining)}
        </p>
      ) : null}

      <p className="mt-2 break-all text-[11px] text-muted/70">{token}</p>

      <Link
        href="/hours"
        className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Done — back to My Hours
      </Link>
    </div>
  );
}
