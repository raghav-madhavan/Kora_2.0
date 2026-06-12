import { notFound } from "next/navigation";
import { PageShell } from "@/components/student/page-shell";
import { OrgDetailClient } from "@/components/student/org-detail-client";
import { getOrgById } from "@/lib/orgs";

interface OrgDetailPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrgDetailPage({ params }: OrgDetailPageProps) {
  const { orgId } = await params;
  const org = getOrgById(orgId);

  if (!org) {
    notFound();
  }

  return (
    <PageShell>
      <OrgDetailClient org={org} />
    </PageShell>
  );
}
