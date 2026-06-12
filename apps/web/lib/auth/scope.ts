/**
 * Data-boundary authorization. Every session-aware store function calls these
 * before reading or mutating, so a micro user invoking a server action
 * directly is blocked here regardless of what middleware or nav allowed.
 */

import type { MacroSession, ModeratorSession } from "@/lib/auth/session";

export class AuthorizationError extends Error {
  constructor(message = "You don't have access to this resource.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function canAccessShift(
  session: ModeratorSession,
  shiftId: string,
): boolean {
  return session.access === "macro" || session.shiftIds.includes(shiftId);
}

export function assertShiftAccess(
  session: ModeratorSession,
  shiftId: string,
): void {
  if (!canAccessShift(session, shiftId)) {
    throw new AuthorizationError(
      "This shift is outside your assigned access.",
    );
  }
}

export function assertMacro(
  session: ModeratorSession,
): asserts session is MacroSession {
  if (session.access !== "macro") {
    throw new AuthorizationError(
      "This action requires organization-level access.",
    );
  }
}

export function scopeShifts<T extends { id: string }>(
  session: ModeratorSession,
  shifts: readonly T[],
): T[] {
  if (session.access === "macro") return [...shifts];
  return shifts.filter((shift) => session.shiftIds.includes(shift.id));
}

export function scopeLogs<T extends { shiftId: string }>(
  session: ModeratorSession,
  logs: readonly T[],
): T[] {
  if (session.access === "macro") return [...logs];
  return logs.filter((log) => session.shiftIds.includes(log.shiftId));
}
