"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { moderatorNotifications as seedNotifications } from "@/lib/mock-data-moderator";
import type { ModeratorNotification } from "@/lib/types/moderator";

const STORAGE_KEY = "kora-moderator-notifications-v1";

function cloneSeedNotifications(): ModeratorNotification[] {
  return seedNotifications.map((notification) => ({ ...notification }));
}

function loadNotifications(): ModeratorNotification[] {
  if (typeof window === "undefined") {
    return cloneSeedNotifications();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneSeedNotifications();
    }
    return JSON.parse(raw) as ModeratorNotification[];
  } catch {
    return cloneSeedNotifications();
  }
}

function saveNotifications(notifications: ModeratorNotification[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

const serverSnapshot = cloneSeedNotifications();

let notifications = cloneSeedNotifications();
const listeners = new Set<() => void>();
let hydrated = false;

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function hydrateFromStorage(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  hydrated = true;
  notifications = loadNotifications();
  emitChange();
}

function getSnapshot(): ModeratorNotification[] {
  return notifications;
}

function getServerSnapshot(): ModeratorNotification[] {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: ModeratorNotification[]): void {
  notifications = next;
  saveNotifications(next);
  emitChange();
}

export function useModeratorNotificationsStore() {
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const notificationList = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const markRead = useCallback((notificationId: string) => {
    const current = getSnapshot();
    const notification = current.find((item) => item.id === notificationId);
    if (!notification || notification.read) {
      return;
    }

    persist(
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
  }, []);

  const markAllRead = useCallback(() => {
    const current = getSnapshot();
    if (current.every((notification) => notification.read)) {
      return;
    }

    persist(current.map((notification) => ({ ...notification, read: true })));
  }, []);

  /** Clears claim alerts once the related log has been decided. */
  const dismissForLog = useCallback((logId: string) => {
    const current = getSnapshot();
    if (
      !current.some(
        (item) => !item.read && item.href?.includes(logId),
      )
    ) {
      return;
    }

    persist(
      current.map((item) =>
        item.href?.includes(logId) ? { ...item, read: true } : item,
      ),
    );
  }, []);

  return {
    notifications: notificationList,
    markRead,
    markAllRead,
    dismissForLog,
  };
}
