import { createServerCaller } from "@/lib/trpc/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

function isForbiddenError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "FORBIDDEN"
  );
}

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

        <div className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-6">
          <h3 className="font-semibold text-[var(--color-ink)]">API endpoints</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            These read-only procedures are available via tRPC at{" "}
            <code className="rounded bg-black/5 px-1">/api/trpc</code>:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[var(--color-ink)]">
            <li>
              <code>school.getComplianceMasterList</code>
            </li>
            <li>
              <code>school.getStudentHours</code>
            </li>
            <li>
              <code>fraud.listFlags</code>
            </li>
            <li>
              <code>export.powerSchool</code>
            </li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    if (isForbiddenError(error)) {
      return (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-surface)] p-8">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            Admin access required
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Your account is signed in but does not have the{" "}
            <code className="rounded bg-black/5 px-1">SCHOOL_ADMIN</code> role.
            Set{" "}
            <code className="rounded bg-black/5 px-1">SEED_ADMIN_EMAIL</code> in{" "}
            <code className="rounded bg-black/5 px-1">.env.local</code> to your
            Clerk email, then sign in again.
          </p>
          <Link
            href="/sign-in"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-primary-deep)]"
          >
            Sign in with a different account
          </Link>
        </div>
      );
    }
    throw error;
  }
}
