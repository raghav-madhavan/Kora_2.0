import Link from "next/link";
import { PageShell } from "@/components/moderator/page-shell";

export default function ModeratorNotFound() {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-full max-w-md rounded-card bg-surface p-10 shadow-card">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">
            404
          </p>
          <h1 className="mt-2 text-[28px] font-bold">Page not found</h1>
          <p className="mt-3 text-[15px] text-muted">
            That page doesn&apos;t exist or may have moved.
          </p>
          <nav className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/moderator"
              className="rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
            >
              Dashboard
            </Link>
            <Link
              href="/moderator/verifications"
              className="rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Verifications
            </Link>
            <Link
              href="/moderator/shifts"
              className="rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Shifts
            </Link>
          </nav>
        </div>
      </div>
    </PageShell>
  );
}
