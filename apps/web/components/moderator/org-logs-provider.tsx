"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  approveLog as approveLogAction,
  rejectLog as rejectLogAction,
} from "@/app/(moderator)/moderator/verifications/actions";
import { useModeratorNotificationsStore } from "@/lib/mock-notifications-store-moderator";
import { mergeOrgLogs, useOrgLogsStore } from "@/lib/org-logs-store";
import type { OrgShiftLog } from "@/lib/types/moderator";

interface OrgLogsContextValue {
  logs: OrgShiftLog[];
  pendingCount: number;
  flaggedCount: number;
  approve: (logId: string) => Promise<OrgShiftLog>;
  reject: (logId: string, reason?: string) => Promise<OrgShiftLog>;
}

const OrgLogsContext = createContext<OrgLogsContextValue | null>(null);

export function OrgLogsProvider({
  initialLogs,
  children,
}: {
  initialLogs: OrgShiftLog[];
  children: React.ReactNode;
}) {
  const { decidedLogs, upsertDecidedLog } = useOrgLogsStore();
  const { dismissForLog } = useModeratorNotificationsStore();

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
    async (logId: string, reason?: string) => {
      const updated = await rejectLogAction(logId, reason);
      upsertDecidedLog(updated);
      dismissForLog(logId);
      return updated;
    },
    [upsertDecidedLog, dismissForLog],
  );

  const value = useMemo<OrgLogsContextValue>(
    () => ({
      logs,
      pendingCount: logs.filter((log) => log.status === "pending").length,
      flaggedCount: logs.filter((log) => log.status === "flagged").length,
      approve,
      reject,
    }),
    [logs, approve, reject],
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
