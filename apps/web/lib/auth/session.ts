/**
 * Session model — the single swap seam for real auth.
 *
 * Mock auth stores this object as JSON in the `kora_session` cookie. The
 * future Clerk swap maps session claims into the same `Session` type; nothing
 * downstream (middleware policy, guards, stores, nav) changes.
 */

export interface StudentSession {
  role: "STUDENT";
  userId: string;
}

export interface MacroSession {
  role: "ORG_MODERATOR";
  access: "macro";
  userId: string;
  orgId: string;
}

export interface MicroSession {
  role: "ORG_MODERATOR";
  access: "micro";
  userId: string;
  orgId: string;
  /** Travels in the session (like a JWT claim) so middleware needs no DB. */
  shiftIds: string[];
}

export type ModeratorSession = MacroSession | MicroSession;
export type Session = StudentSession | ModeratorSession;

export const SESSION_COOKIE = "kora_session";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function serializeSession(session: Session): string {
  return JSON.stringify(session);
}

/** Strict parse: anything malformed is treated as logged-out. */
export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;

  const record = data as Record<string, unknown>;
  if (typeof record.userId !== "string") return null;

  if (record.role === "STUDENT") {
    return { role: "STUDENT", userId: record.userId };
  }

  if (record.role !== "ORG_MODERATOR" || typeof record.orgId !== "string") {
    return null;
  }

  if (record.access === "macro") {
    return {
      role: "ORG_MODERATOR",
      access: "macro",
      userId: record.userId,
      orgId: record.orgId,
    };
  }

  if (record.access === "micro" && isStringArray(record.shiftIds)) {
    return {
      role: "ORG_MODERATOR",
      access: "micro",
      userId: record.userId,
      orgId: record.orgId,
      shiftIds: record.shiftIds,
    };
  }

  return null;
}
