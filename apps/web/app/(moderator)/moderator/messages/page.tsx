import { PageShell } from "@/components/moderator/page-shell";
import { MessagesPageClient } from "@/components/moderator/messages-page-client";

export default function ModeratorMessagesPage() {
  return (
    <PageShell>
      <MessagesPageClient />
    </PageShell>
  );
}
