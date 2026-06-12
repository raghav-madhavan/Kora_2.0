"use client";

import { HoursProvider } from "@/components/student/hours-provider";
import { NotificationsHydrator } from "@/components/student/notifications-hydrator";
import { ToastProvider } from "@/components/student/toast-provider";
import type { AppNotification, ShiftLog } from "@/lib/types/student";

export function StudentShell({
  initialLogs,
  initialNotifications,
  children,
}: {
  initialLogs: ShiftLog[];
  initialNotifications: AppNotification[];
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <HoursProvider initialLogs={initialLogs}>
        <NotificationsHydrator notifications={initialNotifications} />
        {children}
      </HoursProvider>
    </ToastProvider>
  );
}
