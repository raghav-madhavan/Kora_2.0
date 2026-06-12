"use server";

import { revalidatePath } from "next/cache";
import {
  approveOrgLog,
  rejectOrgLog,
} from "@/lib/mock-store-server-moderator";
import type { OrgShiftLog } from "@/lib/types/moderator";

function revalidateModeratorDecisionPaths(logId: string, orgLog: OrgShiftLog): void {
  revalidatePath("/moderator");
  revalidatePath("/moderator/verifications");
  revalidatePath(`/moderator/verifications/${logId}`);
  revalidatePath(`/moderator/shifts/${orgLog.shiftId}`);

  if (orgLog.studentLogId) {
    revalidatePath("/hours");
    revalidatePath(`/hours/${orgLog.studentLogId}`);
    revalidatePath("/");
    revalidatePath("/goals");
  }
}

export async function approveLog(logId: string): Promise<OrgShiftLog> {
  const updated = approveOrgLog(logId);
  revalidateModeratorDecisionPaths(logId, updated);
  return updated;
}

export async function rejectLog(
  logId: string,
  reason?: string,
): Promise<OrgShiftLog> {
  const updated = rejectOrgLog(logId, reason);
  revalidateModeratorDecisionPaths(logId, updated);
  return updated;
}
