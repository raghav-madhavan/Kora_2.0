import { Suspense } from "react";
import { PageShell } from "@/components/student/page-shell";
import { SearchPageClient } from "@/components/student/search-page-client";

export default function SearchPage() {
  return (
    <PageShell>
      <Suspense fallback={null}>
        <SearchPageClient />
      </Suspense>
    </PageShell>
  );
}
