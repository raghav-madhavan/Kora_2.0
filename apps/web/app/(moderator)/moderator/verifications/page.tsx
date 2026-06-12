import { Suspense } from "react";
import { PageShell } from "@/components/moderator/page-shell";
import { VerificationsPageClient } from "@/components/moderator/verifications-page-client";
import { PageHeader } from "@/components/student/page-header";

function VerificationsFallback() {
  return (
    <div className="h-64 animate-pulse rounded-card bg-surface shadow-card" />
  );
}

export default function VerificationsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Verifications"
        description="Approve hours so they count toward student requirements."
      />
      <Suspense fallback={<VerificationsFallback />}>
        <VerificationsPageClient />
      </Suspense>
    </PageShell>
  );
}
