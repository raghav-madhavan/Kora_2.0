import {
  assertShiftAccess,
  canAccessShift,
  scopeLogs,
  scopeShifts,
} from "@/lib/auth/scope";
import type { ModeratorSession } from "@/lib/auth/session";
import { syncOrgDecisionToStudent } from "@/lib/hours-sync";
import { recordAuditEntry } from "@/lib/moderator-audit-log";
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

/** Approve one already-resolved access-checked log. No re-scoping inside. */
function applyApprove(
  session: ModeratorSession,
  log: OrgShiftLog,
): OrgShiftLog {
  if (log.status === "verified") {
    throw new Error("These hours are already verified.");
  }

  const decidedAt = new Date().toISOString();
  const updated: OrgShiftLog = {
    ...log,
    status: "verified",
    verifiedAt: decidedAt,
    decidedAt,
    verifiedByModeratorId: session.userId,
    rejectedByModeratorId: undefined,
    rejectReason: undefined,
  };
  orgLogs = orgLogs.map((l) => (l.id === log.id ? updated : l));
  recordAuditEntry({
    logId: updated.id,
    shiftId: updated.shiftId,
    action: "approve",
    moderatorId: session.userId,
    metadata: { hours: String(updated.hours) },
  });
  syncOrgDecisionToStudent(updated);
  return updated;
}

/** Reject one already-resolved access-checked log. Reason must be non-empty. */
function applyReject(
  session: ModeratorSession,
  log: OrgShiftLog,
  reason: string,
): OrgShiftLog {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("A rejection reason is required so the student knows why.");
  }

  const decidedAt = new Date().toISOString();
  const updated: OrgShiftLog = {
    ...log,
    status: "rejected",
    verifiedAt: null,
    decidedAt,
    verifiedByModeratorId: undefined,
    rejectedByModeratorId: session.userId,
    rejectReason: trimmed,
  };
  orgLogs = orgLogs.map((l) => (l.id === log.id ? updated : l));
  recordAuditEntry({
    logId: updated.id,
    shiftId: updated.shiftId,
    action: "reject",
    moderatorId: session.userId,
    reason: trimmed,
  });
  syncOrgDecisionToStudent(updated);
  return updated;
}

export function approveOrgLog(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog {
  return applyApprove(session, findAccessibleLog(session, logId));
}

export function rejectOrgLog(
  session: ModeratorSession,
  logId: string,
  reason: string,
): OrgShiftLog {
  return applyReject(session, findAccessibleLog(session, logId), reason);
}

/**
 * Batch approve for high-throughput fraud-cluster mitigation. Access is
 * re-checked per id (a micro session batching out-of-scope ids throws before
 * any mutation), so a partial-success batch never leaks across shift scope.
 */
export function approveOrgLogs(
  session: ModeratorSession,
  logIds: string[],
): OrgShiftLog[] {
  const targets = logIds.map((id) => findAccessibleLog(session, id));
  return targets
    .filter((log) => log.status !== "verified")
    .map((log) => applyApprove(session, log));
}

/** Batch reject with one shared reason. Reason must be non-empty. */
export function rejectOrgLogs(
  session: ModeratorSession,
  logIds: string[],
  reason: string,
): OrgShiftLog[] {
  if (!reason.trim()) {
    throw new Error("A rejection reason is required so the student knows why.");
  }
  const targets = logIds.map((id) => findAccessibleLog(session, id));
  return targets.map((log) => applyReject(session, log, reason));
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
