import { AdminForbidden } from "@/components/admin-forbidden";
import { isForbiddenError } from "@/lib/is-forbidden-error";
import { createServerCaller } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const caller = await createServerCaller();

  try {
    const students = await caller.school.getComplianceMasterList();
    const verifiedTotal = students.reduce((sum, s) => sum + s.verifiedHours, 0);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            PowerSchool export
          </h2>
          <p className="mt-1 text-[var(--color-muted)]">
            Download a CSV of student verified hours for import into PowerSchool.
          </p>
        </div>

        <div className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-8">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-[var(--color-muted)]">Students</dt>
              <dd className="text-2xl font-semibold text-[var(--color-ink)]">
                {students.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--color-muted)]">
                Total verified hours
              </dt>
              <dd className="text-2xl font-semibold text-[var(--color-success)]">
                {verifiedTotal}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--color-muted)]">Format</dt>
              <dd className="text-2xl font-semibold text-[var(--color-ink)]">
                CSV
              </dd>
            </div>
          </dl>

          <a
            href="/api/export/powerschool"
            className="mt-8 inline-flex items-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-deep)]"
          >
            Download PowerSchool CSV
          </a>

          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Columns: studentId, firstName, lastName, email, verifiedHours
          </p>
        </div>
      </div>
    );
  } catch (error) {
    if (isForbiddenError(error)) return <AdminForbidden />;
    throw error;
  }
}
