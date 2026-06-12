import { Suspense } from "react";
import { PageShell } from "@/components/moderator/page-shell";
import { SearchPageClient } from "@/components/moderator/search-page-client";
import { requireMacro } from "@/lib/auth/guards";

function SearchFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-full max-w-lg rounded-lg bg-surface shadow-card" />
      <div className="h-28 rounded-card bg-surface shadow-card" />
      <div className="h-28 rounded-card bg-surface shadow-card" />
    </div>
  );
}

export default async function ModeratorSearchPage() {
  await requireMacro();

  return (
    <PageShell>
      <Suspense fallback={<SearchFallback />}>
        <SearchPageClient />
      </Suspense>
    </PageShell>
  );
}
