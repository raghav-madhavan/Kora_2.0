import { Suspense } from "react";
import { PageShell } from "@/components/student/page-shell";
import { MessagesPageClient } from "@/components/student/messages-page-client";

export default function MessagesPage() {
  return (
    <PageShell>
      <Suspense fallback={null}>
        <MessagesPageClient />
      </Suspense>
    </PageShell>
  );
}
