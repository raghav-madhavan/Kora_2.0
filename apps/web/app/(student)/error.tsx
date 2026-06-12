"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageShell } from "@/components/student/page-shell";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-full max-w-md rounded-card bg-surface p-10 shadow-card">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-flagged">
            Something went wrong
          </p>
          <h1 className="mt-2 text-[28px] font-bold">Could not load this page</h1>
          <p className="mt-3 text-[15px] text-muted">
            {error.message ||
              "An unexpected error occurred. Try again or return to your dashboard."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.98]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/hours"
              className="rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              My Hours
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
