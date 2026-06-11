import { AdminForbidden } from "@/components/admin-forbidden";
import { ProgressBar } from "@/components/progress-bar";
import { isForbiddenError } from "@/lib/is-forbidden-error";
import { createServerCaller } from "@/lib/trpc/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const caller = await createServerCaller();

  try {
    const students = await caller.school.getComplianceMasterList();

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            Compliance master list
          </h2>
          <p className="mt-1 text-[var(--color-muted)]">
            All students and their verified service hours toward graduation
            requirements.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/10 bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.02]">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Student
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Verified
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Pending
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Graduation progress
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Bright Futures
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-black/5 last:border-0"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary-deep)]"
                    >
                      {student.firstName} {student.lastName}
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">
                      {student.email}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-[var(--color-success)]">
                    {student.verifiedHours}h
                  </td>
                  <td className="px-4 py-4 text-[var(--color-muted)]">
                    {student.pendingHours}h
                  </td>
                  <td className="min-w-[160px] px-4 py-4">
                    <ProgressBar
                      value={student.verifiedHours}
                      max={student.graduationRequirement}
                    />
                  </td>
                  <td className="px-4 py-4 text-[var(--color-muted)]">
                    {student.brightFutures ? (
                      <span>
                        {student.verifiedHours >= student.brightFutures.gold
                          ? "Gold"
                          : student.verifiedHours >=
                              student.brightFutures.silver
                            ? "Silver"
                            : "Below silver"}{" "}
                        ({student.brightFutures.gold}g /{" "}
                        {student.brightFutures.silver}s)
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 ? (
            <p className="px-4 py-8 text-center text-[var(--color-muted)]">
              No students found. Run{" "}
              <code className="rounded bg-black/5 px-1">npm run db:seed</code>{" "}
              to load demo data.
            </p>
          ) : null}
        </div>
      </div>
    );
  } catch (error) {
    if (isForbiddenError(error)) return <AdminForbidden />;
    throw error;
  }
}
