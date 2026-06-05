import Link from "next/link";
import { ArrowLeft, QrCode, ScanLine } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-8 py-12">
      <div className="w-full max-w-md rounded-card bg-surface p-8 text-center shadow-card">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-accent-lavender text-primary">
          <QrCode size={36} strokeWidth={2} />
        </div>

        <h1 className="text-[24px] font-bold">Scan to Log Hours</h1>
        <p className="mt-2 text-[14px] text-muted">
          Point your camera at the QR code displayed by your organization
          moderator after your shift. Hours are verified automatically once
          scanned.
        </p>

        <div className="mt-8 flex aspect-square items-center justify-center rounded-card border-2 border-dashed border-black/10 bg-canvas">
          <div className="text-center">
            <ScanLine size={48} className="mx-auto text-muted" strokeWidth={1.5} />
            <p className="mt-3 text-[13px] font-medium text-muted">
              Camera access required
            </p>
            <p className="mt-1 text-[12px] text-muted/80">
              QR scanner connects in Phase 1 with HMAC-signed tokens
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
