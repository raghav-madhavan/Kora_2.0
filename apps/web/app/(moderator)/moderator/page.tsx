import { DashboardClient } from "@/components/moderator/dashboard-client";
import { PageShell } from "@/components/moderator/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { moderatorShifts } from "@/lib/mock-data-moderator";

export default function ModeratorDashboardPage() {
  const upcomingShifts = moderatorShifts
    .filter((shift) => shift.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  return (
    <PageShell>
      <PageHeader
        title="Good morning, Elena"
        description="Here is where City Parks volunteering stands today."
      />
      <DashboardClient upcomingShifts={upcomingShifts} />
    </PageShell>
  );
}
