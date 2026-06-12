import { notFound } from "next/navigation";
import { PageShell } from "@/components/moderator/page-shell";
import { ShiftDetailClient } from "@/components/moderator/shift-detail-client";
import { requireModerator } from "@/lib/auth/guards";
import { canAccessShift } from "@/lib/auth/scope";
import { getModeratorShiftById } from "@/lib/mock-data-moderator";
import { getModeratorQrSession } from "@/lib/mock-store-server-moderator";

export default async function ModeratorShiftDetailPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const session = await requireModerator();
  const { shiftId } = await params;
  const shift = getModeratorShiftById(shiftId);

  // Out-of-scope reads as nonexistent: probing ids confirms nothing.
  if (!shift || !canAccessShift(session, shift.id)) {
    notFound();
  }

  const qrSession =
    shift.status === "upcoming"
      ? getModeratorQrSession(session, shift.id)
      : null;

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
