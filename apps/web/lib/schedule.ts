import type { Shift, ShiftLog } from "@/lib/types/student";

export type ScheduleStatus = "upcoming" | "today" | "needs_checkin" | "complete";

export function getVerifiedLogForShift(
  shiftId: string,
  logs: ShiftLog[],
): ShiftLog | undefined {
  return logs.find(
    (log) => log.shiftId === shiftId && log.status === "verified",
  );
}

export function getShiftScheduleStatus(
  shift: Shift,
  logs: ShiftLog[],
  now: Date = new Date(),
): ScheduleStatus {
  const verified = getVerifiedLogForShift(shift.id, logs);
  if (verified) {
    return "complete";
  }

  const scheduled = new Date(shift.scheduledAt);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  if (scheduled >= todayStart && scheduled <= todayEnd) {
    return "today";
  }

  if (scheduled < todayStart) {
    return "needs_checkin";
  }

  return "upcoming";
}

export function formatScheduleDayKey(scheduledAt: string): string {
  return new Date(scheduledAt).toISOString().slice(0, 10);
}

export function formatScheduleDayLabel(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function groupShiftsByDay(shifts: Shift[]): Map<string, Shift[]> {
  const groups = new Map<string, Shift[]>();

  const sorted = [...shifts].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  for (const shift of sorted) {
    const key = formatScheduleDayKey(shift.scheduledAt);
    const existing = groups.get(key) ?? [];
    existing.push(shift);
    groups.set(key, existing);
  }

  return groups;
}
