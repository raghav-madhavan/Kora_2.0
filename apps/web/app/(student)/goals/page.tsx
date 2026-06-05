import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { GoalsOverview } from "@/components/student/goals-overview";

export default function GoalsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Goals"
        description="Progress toward graduation and scholarship requirements"
      />
      <GoalsOverview />
    </PageShell>
  );
}
