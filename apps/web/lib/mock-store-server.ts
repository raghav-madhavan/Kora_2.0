import {
  committedShifts as seedCommittedShifts,
  hoursLog as seedHoursLog,
  shifts,
  student,
} from "@/lib/mock-data";
import { generateShiftQrToken, verifyShiftQrToken } from "@/lib/qr-token";
import type { ShiftLog } from "@/lib/types/student";

interface ShiftQrSession {
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

let shiftQrSessions: ShiftQrSession[] = buildSeedSessions();
let committedShiftIds: string[] = [...seedCommittedShifts];
let scannedShiftIds: string[] = [];
let scannedLogs: ShiftLog[] = [];

export function getShiftQrSessions(): ShiftQrSession[] {
  return shiftQrSessions;
}

export function getActiveShiftQrSession(
  token: string,
): ShiftQrSession | undefined {
  return shiftQrSessions.find((session) => session.token === token);
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
  if (scannedShiftIds.includes(shiftId)) {
    return true;
  }

  return seedHoursLog.some(
    (log) => log.shiftId === shiftId && log.status === "verified",
  );
}

export function getStudentId(): string {
  return student.id;
}

export function getScannedLogs(): ShiftLog[] {
  return scannedLogs;
}

export function getAllHoursLogs(): ShiftLog[] {
  const scannedIds = new Set(scannedLogs.map((log) => log.id));
  const merged = [
    ...scannedLogs,
    ...seedHoursLog.filter((log) => !scannedIds.has(log.id)),
  ];

  return merged.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
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
  const shiftLog: ShiftLog = {
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
    status: "verified",
    avatar: shift.img,
    qrToken: token,
    qrExpiresAt: session.expiresAt,
    verifiedAt: now.toISOString(),
    completedAt: now.toISOString(),
  };

  scannedShiftIds = [...scannedShiftIds, session.shiftId];
  scannedLogs = [shiftLog, ...scannedLogs];
  shiftQrSessions = shiftQrSessions.filter((s) => s.token !== token);

  return {
    shiftLog,
    shiftTitle: shift.title,
  };
}
