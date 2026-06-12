import "server-only";

import { hoursLog as seedHoursLog } from "@/lib/mock-data";
import type { ShiftLog } from "@/lib/types/student";

let scannedLogs: ShiftLog[] = [];
const logOverlays = new Map<string, ShiftLog>();
let scannedShiftIds: string[] = [];

export function getScannedShiftIds(): string[] {
  return scannedShiftIds;
}

export function getScannedLogs(): ShiftLog[] {
  return scannedLogs;
}

export function upsertHoursLog(log: ShiftLog): ShiftLog {
  logOverlays.set(log.id, log);

  if (!seedHoursLog.some((seedLog) => seedLog.id === log.id)) {
    scannedLogs = [log, ...scannedLogs.filter((item) => item.id !== log.id)];
    if (!scannedShiftIds.includes(log.shiftId)) {
      scannedShiftIds = [...scannedShiftIds, log.shiftId];
    }
  }

  return log;
}

export function patchHoursLog(
  id: string,
  patch: Partial<ShiftLog>,
): ShiftLog {
  const existing = getAllHoursLogs().find((log) => log.id === id);
  if (!existing) {
    throw new Error(`Hours log not found: ${id}`);
  }

  return upsertHoursLog({ ...existing, ...patch });
}

export function getAllHoursLogs(): ShiftLog[] {
  const byId = new Map<string, ShiftLog>();

  for (const log of seedHoursLog) {
    byId.set(log.id, log);
  }

  for (const log of scannedLogs) {
    byId.set(log.id, log);
  }

  for (const [id, log] of logOverlays) {
    byId.set(id, log);
  }

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}
