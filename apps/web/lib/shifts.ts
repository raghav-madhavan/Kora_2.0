import { conversationThreads, shifts } from "@/lib/mock-data";
import type { Shift } from "@/lib/types/student";

export function getShiftById(id: string): Shift | undefined {
  return shifts.find((shift) => shift.id === id);
}

export function getAllShifts(): Shift[] {
  return shifts;
}

export function getThreadIdForShift(shiftId: string): string | undefined {
  const thread = conversationThreads.find(
    (t) => t.kind === "moderator" && t.shiftId === shiftId,
  );
  return thread?.id;
}
