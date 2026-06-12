"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarSearch } from "lucide-react";
import { ScheduleDayGroup } from "@/components/student/schedule-day-group";
import { ScheduleWeekStrip } from "@/components/student/schedule-week-strip";
import { useHours } from "@/components/student/hours-provider";
import { useMockStore } from "@/lib/mock-store";
import {
  getShiftScheduleStatus,
  getVerifiedLogForShift,
  groupShiftsByDay,
} from "@/lib/schedule";
export function SchedulePageClient() {
  const { logs } = useHours();
  const store = useMockStore();
  const committedShifts = store.getCommittedShifts();

  const getStatus = useCallback(
    (shift: (typeof committedShifts)[number]) =>
      getShiftScheduleStatus(shift, logs),
    [logs],
  );

  const getVerifiedLog = useCallback(
    (shiftId: string) => getVerifiedLogForShift(shiftId, logs),
    [logs],
  );

  const dayGroups = useMemo(
    () => groupShiftsByDay(committedShifts),
    [committedShifts],
  );

  const dayKeys = useMemo(() => [...dayGroups.keys()], [dayGroups]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const activeDay = selectedDay ?? dayKeys[0] ?? null;

  const visibleGroups = useMemo(() => {
    if (!activeDay) {
      return dayGroups;
    }
    const entry = dayGroups.get(activeDay);
    if (!entry) {
      return dayGroups;
    }
    return new Map([[activeDay, entry]]);
  }, [activeDay, dayGroups]);

  if (committedShifts.length === 0) {
    return (
      <div className="rounded-card bg-surface px-6 py-16 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-lavender">
          <CalendarSearch size={26} className="text-primary" />
        </div>
        <h2 className="text-[20px] font-bold">No shifts scheduled yet</h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
          Commit to a volunteer shift and it will show up here with check-in
          reminders.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex rounded-pill bg-primary px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <>
      <ScheduleWeekStrip
        shifts={committedShifts}
        selectedDay={activeDay}
        getStatus={getStatus}
        onSelectDay={setSelectedDay}
      />

      <div className="flex flex-col gap-8">
        {[...visibleGroups.entries()].map(([dayKey, shifts]) => (
          <ScheduleDayGroup
            key={dayKey}
            dayKey={dayKey}
            shifts={shifts}
            getStatus={getStatus}
            getVerifiedLog={getVerifiedLog}
          />
        ))}
      </div>
    </>
  );
}
