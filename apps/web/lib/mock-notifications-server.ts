import "server-only";

import { appNotifications as seedNotifications } from "@/lib/mock-data";
import type { AppNotification } from "@/lib/types/student";

let runtimeNotifications: AppNotification[] = [];

export function appendServerNotification(notification: AppNotification): void {
  runtimeNotifications = [notification, ...runtimeNotifications];
}

export function getAllNotifications(): AppNotification[] {
  const seen = new Set<string>();
  const merged: AppNotification[] = [];

  for (const notification of [...runtimeNotifications, ...seedNotifications]) {
    if (seen.has(notification.id)) {
      continue;
    }
    seen.add(notification.id);
    merged.push(notification);
  }

  return merged.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
