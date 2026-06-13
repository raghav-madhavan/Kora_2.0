"use server";

import { revalidatePath } from "next/cache";
import { requireModerator } from "@/lib/auth/guards";
import {
  approveOrgLog,
  approveOrgLogs,
  rejectOrgLog,
  rejectOrgLogs,
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
  const session = await requireModerator();
  const updated = approveOrgLog(session, logId);
  revalidateModeratorDecisionPaths(logId, updated);
  return updated;
}

export async function rejectLog(
  logId: string,
  reason: string,
): Promise<OrgShiftLog> {
  const session = await requireModerator();
  const updated = rejectOrgLog(session, logId, reason);
  revalidateModeratorDecisionPaths(logId, updated);
  return updated;
}

export async function approveLogs(logIds: string[]): Promise<OrgShiftLog[]> {
  const session = await requireModerator();
  const updated = approveOrgLogs(session, logIds);
  updated.forEach((log) => revalidateModeratorDecisionPaths(log.id, log));
  return updated;
}

export async function rejectLogs(
  logIds: string[],
  reason: string,
): Promise<OrgShiftLog[]> {
  const session = await requireModerator();
  const updated = rejectOrgLogs(session, logIds, reason);
  updated.forEach((log) => revalidateModeratorDecisionPaths(log.id, log));
  return updated;
}
