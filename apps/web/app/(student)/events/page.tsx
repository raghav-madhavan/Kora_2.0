import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { EventsPageClient } from "@/components/student/events-page-client";

export default function EventsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Events Near You"
        description="Browse and commit to volunteer shifts"
      />
      <EventsPageClient />
    </PageShell>
  );
}
