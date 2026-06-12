import { PageShell } from "@/components/student/page-shell";
import { HourLogDetailPageClient } from "@/components/student/hour-log-detail-page-client";

interface HourLogDetailPageProps {
  params: Promise<{ logId: string }>;
}

export default async function HourLogDetailPage({
  params,
}: HourLogDetailPageProps) {
  const { logId } = await params;

  return (
    <PageShell>
      <HourLogDetailPageClient logId={logId} />
    </PageShell>
  );
}
