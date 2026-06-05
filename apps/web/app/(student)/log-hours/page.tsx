import Link from "next/link";
import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { GenerateQrButton } from "@/components/student/generate-qr-button";
import { getCompletedShiftLogs } from "@/lib/mock-store-server";
import { tints } from "@/lib/mock-data";

export default function LogHoursPage() {
  const completedLogs = getCompletedShiftLogs().filter(
    (log) => log.status === "pending",
  );

  return (
    <PageShell>
      <PageHeader
        title="Log Hours"
        description="Generate a QR code for completed shifts awaiting verification"
      />

      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        {completedLogs.length === 0 ? (
          <p className="px-6 py-12 text-center text-[15px] text-muted">
            No completed shifts awaiting verification.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {completedLogs.map((log) => {
                const tint = tints[log.categoryTint];
                return (
                  <tr key={log.id} className="border-t border-black/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={log.avatar}
                          alt=""
                          className="h-10 w-10 rounded-xl bg-accent-lavender object-cover"
                        />
                        <div>
                          <p className="text-[14px] font-semibold">{log.org}</p>
                          <span
                            className={`mt-1 inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                          >
                            {log.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-ink/80">
                      {log.activity}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-bold">
                      {log.hours} hrs
                    </td>
                    <td className="px-6 py-4 text-[13px] text-muted">
                      {log.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.qrToken ? (
                        <Link
                          href={`/log-hours/${log.id}/qr`}
                          className="text-[13px] font-semibold text-primary hover:underline"
                        >
                          View QR
                        </Link>
                      ) : (
                        <GenerateQrButton shiftLogId={log.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </PageShell>
  );
}
