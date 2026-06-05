import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { hoursLog, tints, type LogStatus } from "@/lib/mock-data";

const statusConfig: Record<
  LogStatus,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  verified: {
    label: "Verified",
    className: "text-success",
    icon: BadgeCheck,
  },
  pending: {
    label: "Pending",
    className: "text-pending",
    icon: Clock3,
  },
  flagged: {
    label: "Flagged",
    className: "text-flagged",
    icon: AlertTriangle,
  },
};

export function HoursTable() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-bold">Recent Hours</h2>
        <Link
          href="/hours"
          className="text-[14px] font-semibold text-primary hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              <th className="px-6 py-4">Organization</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Activity</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Log</th>
            </tr>
          </thead>
          <tbody>
            {hoursLog.map((row) => {
              const tint = tints[row.categoryTint];
              const status = statusConfig[row.status];
              const StatusIcon = status.icon;
              return (
                <tr key={row.id} className="border-t border-black/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.avatar}
                        alt=""
                        className="h-10 w-10 rounded-xl bg-accent-lavender object-cover"
                      />
                      <div>
                        <p className="text-[14px] font-semibold">{row.org}</p>
                        <p className="text-[12px] text-muted">{row.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-ink/80">
                    {row.activity}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-bold">
                    {row.hours} hrs
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${status.className}`}
                    >
                      <StatusIcon size={16} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 text-primary transition hover:bg-accent-lavender"
                    >
                      <ArrowUpRight size={17} strokeWidth={2.4} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
