import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { HoursLedger } from "@/components/student/hours-ledger";
import { getAllHoursLogs } from "@/lib/mock-store-server";

export default function HoursPage() {
  const logs = getAllHoursLogs();

  return (
    <PageShell>
      <PageHeader
        title="My Hours"
        description="Full service hour ledger"
      />
      <HoursLedger logs={logs} />
    </PageShell>
  );
}
