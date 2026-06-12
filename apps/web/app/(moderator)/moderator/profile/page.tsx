import { PageShell } from "@/components/moderator/page-shell";
import { ProfilePageClient } from "@/components/moderator/profile-page-client";
import { PageHeader } from "@/components/student/page-header";
import { requireMacro } from "@/lib/auth/guards";
import { currentModerator } from "@/lib/mock-data-moderator";

export default async function ModeratorProfilePage() {
  await requireMacro();

  return (
    <PageShell>
      <PageHeader
        title="Profile"
        description={`${currentModerator.orgName} · ${currentModerator.roleTitle}`}
      />
      <ProfilePageClient />
    </PageShell>
  );
}
