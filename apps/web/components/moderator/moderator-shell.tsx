"use client";

import { OrgLogsProvider } from "@/components/moderator/org-logs-provider";
import { ToastProvider } from "@/components/student/toast-provider";
import type { OrgShiftLog } from "@/lib/types/moderator";

export function ModeratorShell({
  initialLogs,
  children,
}: {
  initialLogs: OrgShiftLog[];
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <OrgLogsProvider initialLogs={initialLogs}>{children}</OrgLogsProvider>
    </ToastProvider>
  );
}
