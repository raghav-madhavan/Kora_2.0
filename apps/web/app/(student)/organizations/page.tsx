import { Suspense } from "react";
import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { OrganizationsPageClient } from "@/components/student/organizations-page-client";

export default function OrganizationsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Organizations"
        description="Verified community partners"
      />
      <Suspense fallback={null}>
        <OrganizationsPageClient />
      </Suspense>
    </PageShell>
  );
}
