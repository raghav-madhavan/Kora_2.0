import {
  assertShiftAccess,
  canAccessShift,
  scopeLogs,
  scopeShifts,
} from "@/lib/auth/scope";
import type { ModeratorSession } from "@/lib/auth/session";
import { syncOrgDecisionToStudent } from "@/lib/hours-sync";
import {
  moderatorShifts,
  orgShiftLogs as seedLogs,
} from "@/lib/mock-data-moderator";
import {
  ensureShiftQrSession,
  refreshShiftQrSession,
  type ShiftQrSession,
} from "@/lib/mock-store-server";
import type { ModeratorShift, OrgShiftLog } from "@/lib/types/moderator";

let orgLogs: OrgShiftLog[] = [...seedLogs];

export function getOrgLogs(session: ModeratorSession): OrgShiftLog[] {
  return scopeLogs(session, orgLogs).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function getOrgLogById(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog | undefined {
  const log = orgLogs.find((l) => l.id === logId);
  // Out-of-scope reads as "does not exist" — probing ids leaks nothing.
  if (!log || !canAccessShift(session, log.shiftId)) return undefined;
  return log;
}

export function getModeratorShifts(
  session: ModeratorSession,
): ModeratorShift[] {
  return scopeShifts(session, moderatorShifts);
}

export function createOrgLogFromScan(orgLog: OrgShiftLog): OrgShiftLog {
  if (orgLogs.some((log) => log.id === orgLog.id)) {
    return orgLog;
  }

  orgLogs = [orgLog, ...orgLogs];
  return orgLog;
}

function findAccessibleLog(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog {
  const log = orgLogs.find((l) => l.id === logId);
  if (!log) {
    throw new Error("Log not found. It may have been removed.");
  }
  assertShiftAccess(session, log.shiftId);
  return log;
}

export function approveOrgLog(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog {
  const log = findAccessibleLog(session, logId);
  if (log.status === "verified") {
    throw new Error("These hours are already verified.");
  }

  const updated: OrgShiftLog = {
    ...log,
    status: "verified",
    verifiedAt: new Date().toISOString(),
    verifiedByModeratorId: session.userId,
    rejectReason: undefined,
  };
  orgLogs = orgLogs.map((l) => (l.id === logId ? updated : l));
  syncOrgDecisionToStudent(updated);
  return updated;
}

export function rejectOrgLog(
  session: ModeratorSession,
  logId: string,
  reason?: string,
): OrgShiftLog {
  const log = findAccessibleLog(session, logId);

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

/** QR tokens: shift must be the org's AND within the session's access. */
function assertQrAccess(session: ModeratorSession, shiftId: string): void {
  if (!moderatorShifts.some((shift) => shift.id === shiftId)) {
    throw new Error("This shift does not belong to your organization.");
  }
  assertShiftAccess(session, shiftId);
}

export function getModeratorQrSession(
  session: ModeratorSession,
  shiftId: string,
): ShiftQrSession {
  assertQrAccess(session, shiftId);
  return ensureShiftQrSession(shiftId);
}

export function refreshModeratorQrSession(
  session: ModeratorSession,
  shiftId: string,
): ShiftQrSession {
  assertQrAccess(session, shiftId);
  return refreshShiftQrSession(shiftId);
}
