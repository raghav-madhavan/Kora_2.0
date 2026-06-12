"use server";

import { revalidatePath } from "next/cache";
import {
  addCommittedShift,
  scanShiftQr as scanShiftQrInStore,
} from "@/lib/mock-store-server";
import type { ShiftLog } from "@/lib/types/student";

export async function syncCommittedShift(shiftId: string): Promise<void> {
  addCommittedShift(shiftId);
  revalidatePath("/events");
  revalidatePath(`/events/${shiftId}`);
}

export async function scanShiftQr(token: string): Promise<{
  shiftLog: ShiftLog;
  shiftTitle: string;
  org: string;
  hours: number;
}> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("Enter the QR code from your moderator.");
  }

  const result = scanShiftQrInStore(trimmed);

  revalidatePath("/hours");
  revalidatePath(`/hours/${result.shiftLog.id}`);
  revalidatePath("/");
  revalidatePath("/goals");
  revalidatePath("/log-hours");
  revalidatePath("/moderator");
  revalidatePath("/moderator/verifications");
  revalidatePath(`/moderator/shifts/${result.shiftLog.shiftId}`);

  return {
    shiftLog: result.shiftLog,
    shiftTitle: result.shiftTitle,
    org: result.shiftLog.org,
    hours: result.shiftLog.hours,
  };
}
