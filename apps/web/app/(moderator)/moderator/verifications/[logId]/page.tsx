import { notFound } from "next/navigation";
import { PageShell } from "@/components/moderator/page-shell";
import { VerificationDetail } from "@/components/moderator/verification-detail";
import { getOrgLogs } from "@/lib/mock-store-server-moderator";

interface VerificationDetailPageProps {
  params: Promise<{ logId: string }>;
}

export default async function VerificationDetailPage({
  params,
}: VerificationDetailPageProps) {
  const { logId } = await params;
  const log = getOrgLogs().find((l) => l.id === logId);

  if (!log) {
    notFound();
  }

  return (
    <PageShell>
      <VerificationDetail initialLog={log} />
    </PageShell>
  );
}
