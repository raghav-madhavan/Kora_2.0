import { PageShell } from "@/components/moderator/page-shell";
import { ShiftsPageClient } from "@/components/moderator/shifts-page-client";
import { PageHeader } from "@/components/student/page-header";
import { requireModerator } from "@/lib/auth/guards";
import { getModeratorShifts } from "@/lib/mock-store-server-moderator";

export default async function ModeratorShiftsPage() {
  const session = await requireModerator();
  const shifts = getModeratorShifts(session);

  return (
    <PageShell>
      <PageHeader
        title="Shifts"
        description="Your City Parks shift calendar. Open an upcoming shift to display its check-in code."
      />
      <ShiftsPageClient shifts={shifts} />
    </PageShell>
  );
}
