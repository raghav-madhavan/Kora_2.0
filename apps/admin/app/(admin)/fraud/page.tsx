import { AdminForbidden } from "@/components/admin-forbidden";
import { isForbiddenError } from "@/lib/is-forbidden-error";
import { createServerCaller } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

function formatWindow(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleString("en-US", opts)} – ${end.toLocaleString("en-US", opts)}`;
}

export default async function FraudPage() {
  const caller = await createServerCaller();

  try {
    const flags = await caller.fraud.listFlags();

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            Fraud review
          </h2>
          <p className="mt-1 text-[var(--color-muted)]">
            Flags when 3+ students log identical unverified hours within 10
            minutes. Review manually — no auto-dismiss yet.
          </p>
        </div>

        {flags.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-[var(--color-surface)] p-8 text-center text-[var(--color-muted)]">
            No open fraud flags. Your school looks clean.
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag, index) => (
              <div
                key={`${flag.hours}-${index}`}
                className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-surface)] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-danger)]">
                      Suspicious cluster
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
                      {flag.studentCount} students · {flag.hours}h each
                      (unverified)
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      Window: {formatWindow(flag.windowStart, flag.windowEnd)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-danger)]/10 px-3 py-1 text-xs font-medium text-[var(--color-danger)]">
                    Needs review
                  </span>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {flag.students.map((student) => (
                    <li
                      key={student.id}
                      className="rounded-lg bg-black/[0.03] px-3 py-2 text-sm text-[var(--color-ink)]"
                    >
                      {student.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    if (isForbiddenError(error)) return <AdminForbidden />;
    throw error;
  }
}
