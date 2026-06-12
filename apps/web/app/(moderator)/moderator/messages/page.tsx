import { PageShell } from "@/components/moderator/page-shell";
import { MessagesPageClient } from "@/components/moderator/messages-page-client";
import { requireMacro } from "@/lib/auth/guards";

export default async function ModeratorMessagesPage() {
  await requireMacro();

  return (
    <PageShell>
      <MessagesPageClient />
    </PageShell>
  );
}
