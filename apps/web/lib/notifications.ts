import type { AppNotification } from "@/lib/types/student";

export function formatNotificationTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sortNotifications(
  notifications: AppNotification[],
): AppNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function hasUnreadNotifications(
  notifications: AppNotification[],
): boolean {
  return notifications.some((notification) => !notification.read);
}

export function getUnreadNotifications(
  notifications: AppNotification[],
): AppNotification[] {
  return sortNotifications(notifications.filter((notification) => !notification.read));
}
