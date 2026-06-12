import "server-only";

import {
  committedShifts as seedCommittedShifts,
  shifts,
  student,
} from "@/lib/mock-data";
import { createPairedLogsFromQrScan } from "@/lib/hours-sync";
import { createOrgLogFromScan } from "@/lib/mock-store-server-moderator";
import { generateShiftQrToken, verifyShiftQrToken } from "@/lib/qr-token";
import {
  getAllHoursLogs,
  getScannedShiftIds,
  upsertHoursLog,
} from "@/lib/student-hours-server";
import type { ShiftLog } from "@/lib/types/student";

export {
  getAllHoursLogs,
  getScannedLogs,
  patchHoursLog,
  upsertHoursLog,
} from "@/lib/student-hours-server";

export interface ShiftQrSession {
  shiftId: string;
  token: string;
  issuedAt: number;
  expiresAt: string;
}

const DEV_SEED_ISSUED_AT = 1_768_000_000_000;

function buildSeedSessions(): ShiftQrSession[] {
  const activeShiftIds = ["shift_food_bank", "shift_riverside_cleanup"];

  return activeShiftIds.map((shiftId) => {
    const { token, expiresAt, issuedAt } = generateShiftQrToken(
      shiftId,
      DEV_SEED_ISSUED_AT,
    );
    return {
      shiftId,
      token,
      issuedAt,
      expiresAt: expiresAt.toISOString(),
    };
  });
}

let shiftQrSessions: ShiftQrSession[] | null = null;
let committedShiftIds: string[] = [...seedCommittedShifts];

function getShiftQrSessionsState(): ShiftQrSession[] {
  if (!shiftQrSessions) {
    shiftQrSessions = buildSeedSessions();
  }
  return shiftQrSessions;
}

export function getShiftQrSessions(): ShiftQrSession[] {
  return getShiftQrSessionsState();
}

export function getActiveShiftQrSession(
  token: string,
): ShiftQrSession | undefined {
  return getShiftQrSessionsState().find((session) => session.token === token);
}

/** Returns the live session for a shift, minting a fresh one if missing or expired. */
export function ensureShiftQrSession(shiftId: string): ShiftQrSession {
  const sessions = getShiftQrSessionsState();
  const existing = sessions.find((s) => s.shiftId === shiftId);
  if (existing && new Date(existing.expiresAt).getTime() > Date.now()) {
    return existing;
  }
  return refreshShiftQrSession(shiftId);
}

/** Rotates the shift's QR session; the old token stops validating immediately. */
export function refreshShiftQrSession(shiftId: string): ShiftQrSession {
  const { token, expiresAt, issuedAt } = generateShiftQrToken(shiftId);
  const session: ShiftQrSession = {
    shiftId,
    token,
    issuedAt,
    expiresAt: expiresAt.toISOString(),
  };
  shiftQrSessions = [
    ...getShiftQrSessionsState().filter((s) => s.shiftId !== shiftId),
    session,
  ];
  return session;
}

export function isStudentCommittedToShift(shiftId: string): boolean {
  return committedShiftIds.includes(shiftId);
}

export function addCommittedShift(shiftId: string): void {
  if (!committedShiftIds.includes(shiftId)) {
    committedShiftIds = [...committedShiftIds, shiftId];
  }
}

export function hasScannedShift(shiftId: string): boolean {
  if (getScannedShiftIds().includes(shiftId)) {
    return true;
  }

  return getAllHoursLogs().some((log) => log.shiftId === shiftId);
}

export function getStudentId(): string {
  return student.id;
}

export interface ScanShiftQrResult {
  shiftLog: ShiftLog;
  shiftTitle: string;
}

export function scanShiftQr(token: string): ScanShiftQrResult {
  const session = getActiveShiftQrSession(token);

  if (!session) {
    throw new Error("Invalid QR code. Ask your moderator to display a fresh code.");
  }

  if (!verifyShiftQrToken(token, session.shiftId, session.issuedAt)) {
    throw new Error("QR code could not be verified. It may have been tampered with.");
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    throw new Error("This QR code has expired. Ask your moderator for a new one.");
  }

  if (!isStudentCommittedToShift(session.shiftId)) {
    throw new Error(
      "You must commit to this shift before scanning. Find it on Events and commit first.",
    );
  }

  if (hasScannedShift(session.shiftId)) {
    throw new Error("You have already logged hours for this shift.");
  }

  const shift = shifts.find((s) => s.id === session.shiftId);
  if (!shift) {
    throw new Error("Shift not found for this QR code.");
  }

  const now = new Date();
  const baseLog: ShiftLog = {
    id: `log_scan_${session.shiftId}_${now.getTime()}`,
    shiftId: session.shiftId,
    org: shift.org,
    date: now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    category: shift.category,
    categoryKey: shift.categoryKey,
    categoryTint: shift.categoryTint,
    activity: shift.title,
    hours: shift.hours,
    status: "pending",
    avatar: shift.img,
    qrToken: token,
    qrExpiresAt: session.expiresAt,
    verifiedAt: null,
    completedAt: now.toISOString(),
  };

  const { shiftLog, orgLog } = createPairedLogsFromQrScan(baseLog);
  upsertHoursLog(shiftLog);
  createOrgLogFromScan(orgLog);

  shiftQrSessions = getShiftQrSessionsState().filter((s) => s.token !== token);

  return {
    shiftLog,
    shiftTitle: shift.title,
  };
}
