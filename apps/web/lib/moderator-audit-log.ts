/**
 * In-memory moderator decision audit trail.
 *
 * Append-only by design: entries are never mutated or deleted, mirroring the
 * future immutable `ModeratorAuditEntry` Prisma table that district admins and
 * FERPA reviews depend on. Kept free of `server-only` so the recording logic
 * stays unit-testable; it is only ever imported by server modules in practice.
 */

import { canAccessShift } from "@/lib/auth/scope";
import type { ModeratorSession } from "@/lib/auth/session";
import type {
  ModeratorAuditAction,
  ModeratorAuditEntry,
} from "@/lib/types/moderator";

let auditLog: ModeratorAuditEntry[] = [];
let sequence = 0;

interface RecordAuditInput {
  logId: string;
  shiftId: string;
  action: ModeratorAuditAction;
  moderatorId: string;
  reason?: string;
  metadata?: Record<string, string>;
}

/** Append one decision. Returns the stored entry (with generated id/timestamp). */
export function recordAuditEntry(input: RecordAuditInput): ModeratorAuditEntry {
  sequence += 1;
  const entry: ModeratorAuditEntry = {
    id: `audit_${Date.now()}_${sequence}`,
    logId: input.logId,
    shiftId: input.shiftId,
    action: input.action,
    moderatorId: input.moderatorId,
    timestamp: new Date().toISOString(),
    reason: input.reason,
    metadata: input.metadata,
  };
  auditLog = [entry, ...auditLog];
  return entry;
}

/** All decisions for one claim, newest first. */
export function getAuditEntriesForLog(logId: string): ModeratorAuditEntry[] {
  return auditLog.filter((entry) => entry.logId === logId);
}

/**
 * Recent decisions visible to this session, newest first. Macro sees the whole
 * org; micro sees only entries on its assigned shifts (scoped by `shiftId`).
 */
export function getRecentAuditEntries(
  session: ModeratorSession,
  limit = 20,
): ModeratorAuditEntry[] {
  return auditLog
    .filter((entry) => canAccessShift(session, entry.shiftId))
    .slice(0, limit);
}

/** Test-only reset so suites don't leak append-only state between cases. */
export function __resetAuditLogForTests(): void {
  auditLog = [];
  sequence = 0;
}
