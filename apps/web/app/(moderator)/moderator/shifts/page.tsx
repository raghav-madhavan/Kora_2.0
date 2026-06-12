import { PageShell } from "@/components/moderator/page-shell";
import { ShiftsPageClient } from "@/components/moderator/shifts-page-client";
import { PageHeader } from "@/components/student/page-header";
import { moderatorShifts } from "@/lib/mock-data-moderator";

export default function ModeratorShiftsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Shifts"
        description="Your City Parks shift calendar. Open an upcoming shift to display its check-in code."
      />
      <ShiftsPageClient shifts={moderatorShifts} />
    </PageShell>
  );
}
