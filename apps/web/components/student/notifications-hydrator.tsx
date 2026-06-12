"use client";

import { useEffect } from "react";
import { syncServerNotifications } from "@/lib/mock-notifications-store";
import type { AppNotification } from "@/lib/types/student";

export function NotificationsHydrator({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  useEffect(() => {
    syncServerNotifications(notifications);
  }, [notifications]);

  return null;
}
