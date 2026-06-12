"use client";

import { useCallback, useSyncExternalStore } from "react";
import { appNotifications as seedNotifications } from "@/lib/mock-data";
import type { AppNotification } from "@/lib/types/student";

const STORAGE_KEY = "kora-notifications-store-v1";

function cloneSeedNotifications(): AppNotification[] {
  return seedNotifications.map((notification) => ({ ...notification }));
}

function mergeNotifications(
  local: AppNotification[],
  server: AppNotification[],
): AppNotification[] {
  const seen = new Set<string>();
  const merged: AppNotification[] = [];

  for (const notification of [...server, ...local]) {
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

function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") {
    return cloneSeedNotifications();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneSeedNotifications();
    }
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return cloneSeedNotifications();
  }
}

function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

const serverSnapshot = cloneSeedNotifications();

let notifications = cloneSeedNotifications();
let serverNotifications: AppNotification[] = [];
const listeners = new Set<() => void>();
let hydrated = false;

export function syncServerNotifications(next: AppNotification[]): void {
  serverNotifications = next;
  emitChange();
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  notifications = loadNotifications();
  hydrated = true;
}

function getSnapshot(): AppNotification[] {
  ensureHydrated();
  return mergeNotifications(notifications, serverNotifications);
}

function getServerSnapshot(): AppNotification[] {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: AppNotification[]): void {
  notifications = next;
  saveNotifications(next);
  emitChange();
}

export function useNotificationsStore() {
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

  return {
    notifications: notificationList,
    markRead,
    markAllRead,
  };
}
