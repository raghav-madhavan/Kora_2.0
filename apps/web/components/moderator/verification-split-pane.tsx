"use client";

import type { ReactNode } from "react";

/**
 * Master-detail layout for the verification queue. On `lg+` the claim list sits
 * left with a sticky detail pane on the right, so triage never leaves the view.
 * Below `lg` only the list renders — the detail opens as its own page.
 */
export function VerificationSplitPane({
  list,
  detail,
}: {
  list: ReactNode;
  detail: ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
      <div className="min-w-0">{list}</div>
      <aside className="hidden min-w-0 lg:sticky lg:top-[88px] lg:block">
        {detail}
      </aside>
    </div>
  );
}
