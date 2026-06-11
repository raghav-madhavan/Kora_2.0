import { AdminForbidden } from "@/components/admin-forbidden";
import { isForbiddenError } from "@/lib/is-forbidden-error";
import { createServerCaller } from "@/lib/trpc/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caller = await createServerCaller();

  try {
    const logs = await caller.school.getStudentHours({ userId: id });

    if (logs.length === 0) {
      notFound();
    }

    const student = logs[0]?.user;

    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/compliance"
            className="text-sm text-[var(--color-primary-deep)] hover:underline"
          >
            ← Back to compliance
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            {student?.firstName} {student?.lastName}
          </h2>
          <p className="text-[var(--color-muted)]">{student?.email}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/10 bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.02]">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Shift
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Organization
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Hours
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-muted)]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-black/5 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                    {log.shift.title}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {log.shift.org.name}
                  </td>
                  <td className="px-4 py-3">{log.hours}h</td>
                  <td className="px-4 py-3">
                    {log.verifiedAt ? (
                      <span className="text-[var(--color-success)]">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[var(--color-pending,#ffb300)]">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {log.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    if (isForbiddenError(error)) return <AdminForbidden />;
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "NOT_FOUND"
    ) {
      notFound();
    }
    throw error;
  }
}
