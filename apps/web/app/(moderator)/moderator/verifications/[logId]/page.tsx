import { notFound } from "next/navigation";
import { PageShell } from "@/components/moderator/page-shell";
import { VerificationDetail } from "@/components/moderator/verification-detail";
import { requireModerator } from "@/lib/auth/guards";
import { getAuditEntriesForLog } from "@/lib/moderator-audit-log";
import { getOrgLogById } from "@/lib/mock-store-server-moderator";

interface VerificationDetailPageProps {
  params: Promise<{ logId: string }>;
}

export default async function VerificationDetailPage({
  params,
}: VerificationDetailPageProps) {
  const session = await requireModerator();
  const { logId } = await params;
  const log = getOrgLogById(session, logId);

  if (!log) {
    notFound();
  }

  const auditEntries = getAuditEntriesForLog(log.id);

  return (
    <PageShell>
      <VerificationDetail initialLog={log} auditEntries={auditEntries} />
    </PageShell>
  );
}
