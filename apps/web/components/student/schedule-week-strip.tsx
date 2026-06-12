"use client";

import { useMemo } from "react";
import {
  formatScheduleDayKey,
  type ScheduleStatus,
} from "@/lib/schedule";
import type { Shift } from "@/lib/types/student";

interface ScheduleWeekStripProps {
  shifts: Shift[];
  selectedDay: string | null;
  getStatus: (shift: Shift) => ScheduleStatus;
  onSelectDay: (dayKey: string) => void;
}

export function ScheduleWeekStrip({
  shifts,
  selectedDay,
  getStatus,
  onSelectDay,
}: ScheduleWeekStripProps) {
  const days = useMemo(() => {
    const map = new Map<
      string,
      { dayKey: string; count: number; hasAction: boolean; date: Date }
    >();

    for (const shift of shifts) {
      const dayKey = formatScheduleDayKey(shift.scheduledAt);
      const existing = map.get(dayKey);
      const status = getStatus(shift);
      const needsAction =
        status === "today" || status === "needs_checkin";

      if (existing) {
        existing.count += 1;
        existing.hasAction = existing.hasAction || needsAction;
      } else {
        map.set(dayKey, {
          dayKey,
          count: 1,
          hasAction: needsAction,
          date: new Date(shift.scheduledAt),
        });
      }
    }

    return [...map.values()].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [shifts, getStatus]);

  if (days.length === 0) {
    return null;
  }

  return (
    <div className="no-scrollbar mb-8 flex gap-3 overflow-x-auto scroll-smooth pb-1">
      {days.map((day) => {
        const active = selectedDay === day.dayKey;
        const weekday = day.date.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const dayNum = day.date.getDate();

        return (
          <button
            key={day.dayKey}
            type="button"
            onClick={() => onSelectDay(day.dayKey)}
            className={`relative flex w-[72px] shrink-0 snap-start flex-col items-center rounded-card px-3 py-4 transition ${
              active
                ? "bg-primary text-white shadow-raised"
                : "bg-surface text-ink shadow-card hover:bg-accent-lavender"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              {weekday}
            </span>
            <span className="mt-1 text-[22px] font-extrabold">{dayNum}</span>
            {day.count > 1 ? (
              <span
                className={`mt-1 text-[10px] font-semibold ${
                  active ? "text-white/85" : "text-muted"
                }`}
              >
                {day.count} shifts
              </span>
            ) : null}
            {day.hasAction ? (
              <span
                className={`absolute right-2 top-2 h-2 w-2 rounded-full ${
                  active ? "bg-white" : "bg-primary"
                }`}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
