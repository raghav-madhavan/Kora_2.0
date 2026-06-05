import {
  completedShiftLogs as seedCompletedShiftLogs,
  student,
} from "@/lib/mock-data";
import type { ShiftLog } from "@/lib/types/student";

let completedShiftLogs: ShiftLog[] = seedCompletedShiftLogs.map((log) => ({
  ...log,
}));

export function getCompletedShiftLogs(): ShiftLog[] {
  return completedShiftLogs;
}

export function getShiftLogById(shiftLogId: string): ShiftLog | undefined {
  return completedShiftLogs.find((log) => log.id === shiftLogId);
}

export function setShiftLogQrToken(
  shiftLogId: string,
  qrToken: string,
  qrExpiresAt: string,
): ShiftLog | undefined {
  const index = completedShiftLogs.findIndex((log) => log.id === shiftLogId);
  if (index === -1) {
    return undefined;
  }

  const updated: ShiftLog = {
    ...completedShiftLogs[index]!,
    qrToken,
    qrExpiresAt,
  };
  completedShiftLogs = [
    ...completedShiftLogs.slice(0, index),
    updated,
    ...completedShiftLogs.slice(index + 1),
  ];
  return updated;
}

export function getStudentId(): string {
  return student.id;
}
