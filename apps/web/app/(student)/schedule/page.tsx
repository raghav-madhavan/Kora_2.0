import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { SchedulePageClient } from "@/components/student/schedule-page-client";

export default function SchedulePage() {
  return (
    <PageShell>
      <PageHeader
        title="My Schedule"
        description="Shifts you've committed to"
      />
      <SchedulePageClient />
    </PageShell>
  );
}
