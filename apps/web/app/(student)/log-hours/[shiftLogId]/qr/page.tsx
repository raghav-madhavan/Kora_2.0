import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/student/page-shell";
import { QrDisplay } from "@/components/student/qr-display";
import { GenerateQrButton } from "@/components/student/generate-qr-button";
import { getShiftLogById } from "@/lib/mock-store-server";
import { shifts } from "@/lib/mock-data";

interface QrPageProps {
  params: Promise<{ shiftLogId: string }>;
}

export default async function QrPage({ params }: QrPageProps) {
  const { shiftLogId } = await params;
  const shiftLog = getShiftLogById(shiftLogId);

  if (!shiftLog) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-[18px] font-bold">Shift log not found</p>
          <Link
            href="/log-hours"
            className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Log Hours
          </Link>
        </div>
      </PageShell>
    );
  }

  const shift = shifts.find((s) => s.id === shiftLog.shiftId);
  const shiftTitle = shift?.title ?? shiftLog.activity;

  if (!shiftLog.qrToken) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-md rounded-card bg-surface p-8 text-center shadow-card">
          <h1 className="text-[24px] font-bold">Generate QR Code</h1>
          <p className="mt-2 text-[14px] text-muted">
            {shiftTitle} · {shiftLog.org} · {shiftLog.hours} hrs
          </p>
          <p className="mt-4 text-[13px] text-muted">
            Request a signed QR token to show your organization moderator.
          </p>
          <div className="mt-8 flex justify-center">
            <GenerateQrButton shiftLogId={shiftLogId} />
          </div>
          <Link
            href="/log-hours"
            className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Log Hours
          </Link>
        </div>
      </PageShell>
    );
  }

  const qrDataUrl = await QRCode.toDataURL(shiftLog.qrToken, { width: 280 });
  const expiresAt =
    shiftLog.qrExpiresAt ??
    new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return (
    <PageShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <QrDisplay
          token={shiftLog.qrToken}
          qrDataUrl={qrDataUrl}
          expiresAt={expiresAt}
          shiftTitle={shiftTitle}
          org={shiftLog.org}
          hours={shiftLog.hours}
        />
      </div>
    </PageShell>
  );
}
