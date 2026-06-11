import { AdminForbidden } from "@/components/admin-forbidden";
import { isForbiddenError } from "@/lib/is-forbidden-error";
import { createServerCaller } from "@/lib/trpc/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "success" | "danger" | "default";
}) {
  const valueColor =
    accent === "success"
      ? "text-[var(--color-success)]"
      : accent === "danger"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-ink)]";

  return (
    <div className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-6">
      <p className="text-sm text-[var(--color-muted)]">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const caller = await createServerCaller();

  try {
    const overview = await caller.school.getOverview();

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            Overview
          </h2>
          <p className="mt-1 text-[var(--color-muted)]">
            School-wide compliance snapshot from your database.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Students" value={overview.studentCount} />
          <StatCard label="Organizations" value={overview.orgCount} />
          <StatCard
            label="Verified hours"
            value={overview.verifiedHours}
            accent="success"
          />
          <StatCard label="Pending hours" value={overview.pendingHours} />
          <StatCard
            label="Fraud flags"
            value={overview.openFraudFlags}
            accent={overview.openFraudFlags > 0 ? "danger" : "default"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/compliance"
            className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-6 hover:border-[var(--color-primary)]/40"
          >
            <h3 className="font-semibold text-[var(--color-ink)]">
              Compliance master list
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              View all students, verified hours, and graduation progress.
            </p>
          </Link>
          <Link
            href="/fraud"
            className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-6 hover:border-[var(--color-danger)]/40"
          >
            <h3 className="font-semibold text-[var(--color-ink)]">
              Fraud review
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {overview.openFraudFlags > 0
                ? `${overview.openFraudFlags} flag(s) need review`
                : "No open flags"}
            </p>
          </Link>
          <Link
            href="/export"
            className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-6 hover:border-[var(--color-primary)]/40"
          >
            <h3 className="font-semibold text-[var(--color-ink)]">
              PowerSchool export
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Download verified hours as CSV.
            </p>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    if (isForbiddenError(error)) return <AdminForbidden />;
    throw error;
  }
}
