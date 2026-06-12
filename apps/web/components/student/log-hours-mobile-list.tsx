"use client";

import { ScanLine } from "lucide-react";
import { getModeratorById, tints } from "@/lib/mock-data";
import type { Shift } from "@/lib/types/student";

interface LogHoursMobileListProps {
  shifts: Shift[];
}

export function LogHoursMobileList({ shifts }: LogHoursMobileListProps) {
  if (shifts.length === 0) {
    return (
      <p className="rounded-card bg-surface px-6 py-12 text-center text-[15px] text-muted shadow-card">
        No committed shifts yet. Browse Events and commit to a shift first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:hidden">
      {shifts.map((shift) => {
        const tint = tints[shift.categoryTint];
        const moderator = getModeratorById(shift.moderatorId);

        return (
          <article
            key={shift.id}
            className="rounded-card bg-surface p-4 shadow-card"
          >
            <p className="text-[15px] font-semibold">{shift.title}</p>
            <p className="mt-1 text-[12px] text-muted">{shift.date}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
              >
                {shift.category}
              </span>
              <span className="text-[14px] font-bold">{shift.hours} hrs</span>
            </div>
            <p className="mt-2 text-[13px] text-muted">{shift.org}</p>
            {moderator ? (
              <p className="mt-1 text-[12px] text-muted">
                Verifies: {moderator.name}
              </p>
            ) : null}
            <a
              href="#check-in"
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
            >
              <ScanLine size={15} />
              Enter check-in code
            </a>
          </article>
        );
      })}
    </div>
  );
}
