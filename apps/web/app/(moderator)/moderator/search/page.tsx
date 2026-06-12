import { Suspense } from "react";
import { PageShell } from "@/components/moderator/page-shell";
import { SearchPageClient } from "@/components/moderator/search-page-client";

function SearchFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-full max-w-lg rounded-lg bg-surface shadow-card" />
      <div className="h-28 rounded-card bg-surface shadow-card" />
      <div className="h-28 rounded-card bg-surface shadow-card" />
    </div>
  );
}

export default function ModeratorSearchPage() {
  return (
    <PageShell>
      <Suspense fallback={<SearchFallback />}>
        <SearchPageClient />
      </Suspense>
    </PageShell>
  );
}
