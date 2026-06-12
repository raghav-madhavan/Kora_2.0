"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import QRCode from "qrcode";
import { Copy, RefreshCw, TimerOff } from "lucide-react";
import { refreshQr } from "@/app/(moderator)/moderator/shifts/[shiftId]/actions";
import { useToast } from "@/components/student/toast-provider";

interface QrDisplayPanelProps {
  shiftId: string;
  shiftTitle: string;
  initialToken: string;
  initialExpiresAt: string;
}

function remainingMs(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function QrDisplayPanel({
  shiftId,
  shiftTitle,
  initialToken,
  initialExpiresAt,
}: QrDisplayPanelProps) {
  const toast = useToast();
  const [token, setToken] = useState(initialToken);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [msLeft, setMsLeft] = useState(() => remainingMs(initialExpiresAt));
  const [isRefreshing, startRefresh] = useTransition();

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(token, {
      width: 680,
      margin: 1,
      color: { dark: "#1a1915", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    setMsLeft(remainingMs(expiresAt));
    const interval = setInterval(() => {
      setMsLeft(remainingMs(expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const expired = msLeft <= 0;

  const handleRefresh = useCallback(() => {
    startRefresh(async () => {
      try {
        const session = await refreshQr(shiftId);
        setToken(session.token);
        setExpiresAt(session.expiresAt);
        toast.success("New check-in code issued");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not refresh the code",
        );
      }
    });
  }, [shiftId, toast]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Check-in code copied");
    } catch {
      toast.error("Could not copy the code. Select it manually instead.");
    }
  }

  return (
    <section
      aria-label={`Check-in code for ${shiftTitle}`}
      className="rounded-card bg-surface p-6 shadow-card"
    >
      <div className="mx-auto flex w-full max-w-[380px] flex-col items-center">
        <div className="relative w-full max-w-[340px]">
          <div
            className={`overflow-hidden rounded-2xl border border-black/5 bg-white p-4 transition-opacity duration-200 ${
              expired ? "opacity-20" : "opacity-100"
            }`}
          >
            {qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt={`QR check-in code for ${shiftTitle}`}
                className="aspect-square w-full"
              />
            ) : (
              <div
                className="aspect-square w-full animate-pulse rounded-xl bg-canvas"
                aria-hidden
              />
            )}
          </div>

          {expired ? (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface/95 px-6 py-5 text-center shadow-raised">
                <TimerOff size={24} strokeWidth={2.2} className="text-muted" />
                <p className="text-[15px] font-bold">Code expired</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    strokeWidth={2.4}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                  Issue new code
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 text-center">
          <p aria-live="polite" className="sr-only">
            {expired ? "The check-in code has expired." : ""}
          </p>
          {expired ? (
            <p className="text-[14px] font-semibold text-muted">
              Students can no longer scan this code.
            </p>
          ) : (
            <>
              <p className="font-mono text-[34px] font-semibold tracking-tight">
                {formatCountdown(msLeft)}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                until this code expires. Students scan it from Log Hours.
              </p>
            </>
          )}
        </div>

        <div className="mt-5 flex w-full flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-pill bg-panel px-5 py-2.5 text-[14px] font-semibold text-cream transition hover:bg-primary-deep disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              strokeWidth={2.4}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing…" : "Refresh code"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            <Copy size={15} strokeWidth={2.4} />
            Copy code
          </button>
        </div>
      </div>
    </section>
  );
}
