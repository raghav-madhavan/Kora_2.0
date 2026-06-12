import { notFound } from "next/navigation";
import { PageShell } from "@/components/moderator/page-shell";
import { ShiftDetailClient } from "@/components/moderator/shift-detail-client";
import { getModeratorShiftById } from "@/lib/mock-data-moderator";
import { getModeratorQrSession } from "@/lib/mock-store-server-moderator";

export default async function ModeratorShiftDetailPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const { shiftId } = await params;
  const shift = getModeratorShiftById(shiftId);

  if (!shift) {
    notFound();
  }

  const qrSession =
    shift.status === "upcoming" ? getModeratorQrSession(shift.id) : null;

  return (
    <PageShell>
      <ShiftDetailClient
        shift={shift}
        qrSession={
          qrSession
            ? { token: qrSession.token, expiresAt: qrSession.expiresAt }
            : null
        }
      />
    </PageShell>
  );
}
