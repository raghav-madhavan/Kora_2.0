"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  approveLog as approveLogAction,
  approveLogs as approveLogsAction,
  rejectLog as rejectLogAction,
  rejectLogs as rejectLogsAction,
} from "@/app/(moderator)/moderator/verifications/actions";
import { useModeratorNotificationsStore } from "@/lib/mock-notifications-store-moderator";
import { mergeOrgLogs, useOrgLogsStore } from "@/lib/org-logs-store";
import type { OrgShiftLog } from "@/lib/types/moderator";

interface OrgLogsContextValue {
  logs: OrgShiftLog[];
  pendingCount: number;
  flaggedCount: number;
  approve: (logId: string) => Promise<OrgShiftLog>;
  reject: (logId: string, reason: string) => Promise<OrgShiftLog>;
  approveMany: (logIds: string[]) => Promise<OrgShiftLog[]>;
  rejectMany: (logIds: string[], reason: string) => Promise<OrgShiftLog[]>;
  refresh: () => void;
}

const OrgLogsContext = createContext<OrgLogsContextValue | null>(null);

export function OrgLogsProvider({
  initialLogs,
  children,
}: {
  initialLogs: OrgShiftLog[];
  children: React.ReactNode;
}) {
  const {
    decidedLogs,
    upsertDecidedLog,
    upsertDecidedLogs,
    reconcileWithServer,
  } = useOrgLogsStore();
  const { dismissForLog } = useModeratorNotificationsStore();
  const router = useRouter();

  // Server is the source of truth: whenever a fresh server render arrives (or
  // the overlay hydrates from localStorage), drop optimistic overlay entries
  // the server has already caught up on. Converges — reconcile only persists
  // when it actually prunes, so this never loops.
  useEffect(() => {
    reconcileWithServer(initialLogs);
  }, [initialLogs, decidedLogs, reconcileWithServer]);

  const logs = useMemo(
    () => mergeOrgLogs(initialLogs, decidedLogs),
    [initialLogs, decidedLogs],
  );

  const approve = useCallback(
    async (logId: string) => {
      const updated = await approveLogAction(logId);
      upsertDecidedLog(updated);
      dismissForLog(logId);
      return updated;
    },
    [upsertDecidedLog, dismissForLog],
  );

  const reject = useCallback(
    async (logId: string, reason: string) => {
      const updated = await rejectLogAction(logId, reason);
      upsertDecidedLog(updated);
      dismissForLog(logId);
      return updated;
    },
    [upsertDecidedLog, dismissForLog],
  );

  const approveMany = useCallback(
    async (logIds: string[]) => {
      const updated = await approveLogsAction(logIds);
      upsertDecidedLogs(updated);
      updated.forEach((log) => dismissForLog(log.id));
      return updated;
    },
    [upsertDecidedLogs, dismissForLog],
  );

  const rejectMany = useCallback(
    async (logIds: string[], reason: string) => {
      const updated = await rejectLogsAction(logIds, reason);
      upsertDecidedLogs(updated);
      updated.forEach((log) => dismissForLog(log.id));
      return updated;
    },
    [upsertDecidedLogs, dismissForLog],
  );

  const refresh = useCallback(() => router.refresh(), [router]);

  const value = useMemo<OrgLogsContextValue>(
    () => ({
      logs,
      pendingCount: logs.filter((log) => log.status === "pending").length,
      flaggedCount: logs.filter((log) => log.status === "flagged").length,
      approve,
      reject,
      approveMany,
      rejectMany,
      refresh,
    }),
    [logs, approve, reject, approveMany, rejectMany, refresh],
  );

  return (
    <OrgLogsContext.Provider value={value}>{children}</OrgLogsContext.Provider>
  );
}

export function useOrgLogs(): OrgLogsContextValue {
  const ctx = useContext(OrgLogsContext);
  if (!ctx) {
    throw new Error("useOrgLogs must be used inside OrgLogsProvider");
  }
  return ctx;
}
