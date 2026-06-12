import { syncOrgDecisionToStudent } from "@/lib/hours-sync";
import {
  currentModerator,
  moderatorShifts,
  orgShiftLogs as seedLogs,
} from "@/lib/mock-data-moderator";
import {
  ensureShiftQrSession,
  refreshShiftQrSession,
  type ShiftQrSession,
} from "@/lib/mock-store-server";
import type { OrgShiftLog } from "@/lib/types/moderator";

let orgLogs: OrgShiftLog[] = [...seedLogs];

export function getOrgLogs(): OrgShiftLog[] {
  return [...orgLogs].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function getOrgLogById(logId: string): OrgShiftLog | undefined {
  return getOrgLogs().find((log) => log.id === logId);
}

export function createOrgLogFromScan(orgLog: OrgShiftLog): OrgShiftLog {
  if (orgLogs.some((log) => log.id === orgLog.id)) {
    return orgLog;
  }

  orgLogs = [orgLog, ...orgLogs];
  return orgLog;
}

export function approveOrgLog(logId: string): OrgShiftLog {
  const log = orgLogs.find((l) => l.id === logId);
  if (!log) {
    throw new Error("Log not found. It may have been removed.");
  }
  if (log.status === "verified") {
    throw new Error("These hours are already verified.");
  }

  const updated: OrgShiftLog = {
    ...log,
    status: "verified",
    verifiedAt: new Date().toISOString(),
    verifiedByModeratorId: currentModerator.id,
    rejectReason: undefined,
  };
  orgLogs = orgLogs.map((l) => (l.id === logId ? updated : l));
  syncOrgDecisionToStudent(updated);
  return updated;
}

export function rejectOrgLog(logId: string, reason?: string): OrgShiftLog {
  const log = orgLogs.find((l) => l.id === logId);
  if (!log) {
    throw new Error("Log not found. It may have been removed.");
  }

  const updated: OrgShiftLog = {
    ...log,
    status: "rejected",
    verifiedAt: null,
    verifiedByModeratorId: undefined,
    rejectReason: reason ?? "Rejected by moderator.",
  };
  orgLogs = orgLogs.map((l) => (l.id === logId ? updated : l));
  syncOrgDecisionToStudent(updated);
  return updated;
}

/** Tokens may only be issued for this moderator's org shifts. */
function assertOrgShift(shiftId: string): void {
  if (!moderatorShifts.some((shift) => shift.id === shiftId)) {
    throw new Error("This shift does not belong to your organization.");
  }
}

export function getModeratorQrSession(shiftId: string): ShiftQrSession {
  assertOrgShift(shiftId);
  return ensureShiftQrSession(shiftId);
}

export function refreshModeratorQrSession(shiftId: string): ShiftQrSession {
  assertOrgShift(shiftId);
  return refreshShiftQrSession(shiftId);
}
