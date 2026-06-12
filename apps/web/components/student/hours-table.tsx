"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { tints } from "@/lib/mock-data";
import { useHours } from "@/components/student/hours-provider";
import { LogStatusChip } from "@/components/shared/log-status-chip";

export function HoursTable() {
  const { logs } = useHours();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[20px] font-semibold tracking-tight">
          Recent Hours
        </h2>
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
            <tr className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/80">
              <th className="px-6 py-4">Organization</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Activity</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Log</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 4).map((row) => {
              const tint = tints[row.categoryTint];
              return (
                <tr
                  key={row.id}
                  className="border-t border-black/5 transition-colors hover:bg-canvas/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.avatar}
                        alt=""
                        className="h-11 w-11 rounded-xl bg-accent-lavender object-cover"
                      />
                      <div>
                        <p className="text-[15px] font-bold">{row.org}</p>
                        <p className="text-[12px] text-muted">{row.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-semibold ${tint.bg} ${tint.fg}`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-ink/80">
                    {row.activity}
                  </td>
                  <td className="px-6 py-4 font-mono text-[14px] font-semibold tabular-nums">
                    {row.hours} hrs
                  </td>
                  <td className="px-6 py-4">
                    <LogStatusChip status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/hours/${row.id}`}
                      className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 text-primary transition hover:bg-accent-lavender"
                    >
                      <ArrowUpRight size={17} strokeWidth={2.4} />
                    </Link>
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
