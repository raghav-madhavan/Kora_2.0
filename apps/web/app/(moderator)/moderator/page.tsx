import { DashboardClient } from "@/components/moderator/dashboard-client";
import { PageShell } from "@/components/moderator/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { requireMacro } from "@/lib/auth/guards";
import { moderatorProfiles } from "@/lib/mock-data-moderator";
import { getModeratorShifts } from "@/lib/mock-store-server-moderator";

export default async function ModeratorDashboardPage() {
  const session = await requireMacro();
  const persona = moderatorProfiles[session.userId];
  const firstName = persona ? persona.name.split(" ")[0] : "there";

  const upcomingShifts = getModeratorShifts(session)
    .filter((shift) => shift.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  return (
    <PageShell>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here is where City Parks volunteering stands today."
      />
      <DashboardClient upcomingShifts={upcomingShifts} />
    </PageShell>
  );
}
