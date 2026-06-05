"use server";

import { generateQrToken } from "@/lib/qr-token";
import {
  getShiftLogById,
  getStudentId,
  setShiftLogQrToken,
} from "@/lib/mock-store-server";
import { shifts } from "@/lib/mock-data";

export async function requestQrToken(shiftLogId: string): Promise<{
  token: string;
  expiresAt: string;
  shiftTitle: string;
  org: string;
  hours: number;
}> {
  const shiftLog = getShiftLogById(shiftLogId);

  if (!shiftLog) {
    throw new Error("Shift log not found");
  }

  if (shiftLog.status !== "pending") {
    throw new Error("Only pending shift logs can request a QR token");
  }

  if (shiftLog.qrToken) {
    throw new Error("QR token already issued for this shift log");
  }

  if (new Date(shiftLog.completedAt).getTime() >= Date.now()) {
    throw new Error("Shift has not been completed yet");
  }

  const { token, expiresAt } = generateQrToken(shiftLogId, getStudentId());
  setShiftLogQrToken(shiftLogId, token, expiresAt.toISOString());

  const shift = shifts.find((s) => s.id === shiftLog.shiftId);

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    shiftTitle: shift?.title ?? shiftLog.activity,
    org: shiftLog.org,
    hours: shiftLog.hours,
  };
}
