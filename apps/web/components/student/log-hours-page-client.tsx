"use client";

import Link from "next/link";
import { ScanLine } from "lucide-react";
import { PageHeader } from "@/components/student/page-header";
import { ScanQrPanel } from "@/components/student/scan-qr-panel";
import { useMockStore } from "@/lib/mock-store";
import { getModeratorById, tints } from "@/lib/mock-data";

interface LogHoursPageClientProps {
  demoToken?: string;
}

export function LogHoursPageClient({ demoToken }: LogHoursPageClientProps) {
  const store = useMockStore();
  const committedShifts = store.getCommittedShifts();

  return (
    <>
      <PageHeader
        title="Log Hours"
        description="Enter the check-in code your moderator displays at the end of your shift"
      />

      <div
        id="check-in"
        className="mb-8 scroll-mt-24 rounded-card bg-accent-lavender/50 p-6 shadow-card"
      >
        <div className="mb-6">
          <h2 className="text-[18px] font-bold">Ready to check in?</h2>
          <p className="mt-1 max-w-xl text-[14px] text-muted">
            Your moderator will display a check-in code when your shift ends.
            Enter it here to log and verify your hours instantly.
          </p>
        </div>

        <ScanQrPanel demoToken={demoToken} />
      </div>

      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        {committedShifts.length === 0 ? (
          <p className="px-6 py-12 text-center text-[15px] text-muted">
            No committed shifts yet. Browse{" "}
            <Link href="/events" className="font-semibold text-primary hover:underline">
              Events
            </Link>{" "}
            and commit to a shift first.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Moderator</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {committedShifts.map((shift) => {
                const tint = tints[shift.categoryTint];
                const moderator = getModeratorById(shift.moderatorId);
                return (
                  <tr key={shift.id} className="border-t border-black/5">
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-semibold">{shift.title}</p>
                      <p className="mt-1 text-[12px] text-muted">{shift.date}</p>
                      <span
                        className={`mt-2 inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                      >
                        {shift.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px]">{shift.org}</td>
                    <td className="px-6 py-4 text-[14px] font-bold">
                      {shift.hours} hrs
                    </td>
                    <td className="px-6 py-4">
                      {moderator ? (
                        <div>
                          <p className="text-[13px] font-semibold">
                            {moderator.name}
                          </p>
                          <p className="text-[12px] text-muted">
                            {moderator.roleTitle}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[13px] text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href="#check-in"
                        className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-deep"
                      >
                        <ScanLine size={14} />
                        Enter code
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
