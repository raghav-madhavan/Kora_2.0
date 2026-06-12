"use client";

import { OrgLogsProvider } from "@/components/moderator/org-logs-provider";
import { ModeratorSessionProvider } from "@/components/moderator/session-provider";
import { ToastProvider } from "@/components/student/toast-provider";
import type { ModeratorSession } from "@/lib/auth/session";
import type { ModeratorProfile, OrgShiftLog } from "@/lib/types/moderator";

export function ModeratorShell({
  initialLogs,
  session,
  persona,
  children,
}: {
  initialLogs: OrgShiftLog[];
  session: ModeratorSession;
  persona: ModeratorProfile;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ModeratorSessionProvider session={session} persona={persona}>
        <OrgLogsProvider initialLogs={initialLogs}>{children}</OrgLogsProvider>
      </ModeratorSessionProvider>
    </ToastProvider>
  );
}
