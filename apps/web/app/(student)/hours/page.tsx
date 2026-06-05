import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { HoursLedger } from "@/components/student/hours-ledger";

export default function HoursPage() {
  return (
    <PageShell>
      <PageHeader
        title="My Hours"
        description="Full service hour ledger"
      />
      <HoursLedger />
    </PageShell>
  );
}
