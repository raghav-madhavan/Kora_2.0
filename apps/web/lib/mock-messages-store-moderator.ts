"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { orgInboxThreads as seedThreads } from "@/lib/mock-data-moderator";
import type { ChatMessage } from "@/lib/types/student";
import type { OrgInboxThread } from "@/lib/types/moderator";

const STORAGE_KEY = "kora-moderator-messages-store-v1";

function cloneSeedThreads(): OrgInboxThread[] {
  return seedThreads.map((thread) => ({ ...thread }));
}

function loadThreads(): OrgInboxThread[] {
  if (typeof window === "undefined") {
    return cloneSeedThreads();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneSeedThreads();
    }
    return JSON.parse(raw) as OrgInboxThread[];
  } catch {
    return cloneSeedThreads();
  }
}

function saveThreads(threads: OrgInboxThread[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

const serverSnapshot = cloneSeedThreads();

let threads = cloneSeedThreads();
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
  threads = loadThreads();
  emitChange();
}

function getSnapshot(): OrgInboxThread[] {
  return threads;
}

function getServerSnapshot(): OrgInboxThread[] {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: OrgInboxThread[]): void {
  threads = next;
  saveThreads(next);
  emitChange();
}

export function useModeratorMessagesStore() {
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const threadList = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const sendMessage = useCallback((threadId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    const now = new Date().toISOString();
    const newMessage: ChatMessage = {
      id: `org_msg_${threadId}_${Date.now()}`,
      sender: "moderator",
      body: trimmed,
      sentAt: now,
    };

    persist(
      getSnapshot().map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              unread: false,
              messages: [...thread.messages, newMessage],
              updatedAt: now,
            }
          : thread,
      ),
    );
  }, []);

  const markRead = useCallback((threadId: string) => {
    const current = getSnapshot();
    const thread = current.find((item) => item.id === threadId);
    if (!thread?.unread) {
      return;
    }

    persist(
      current.map((item) =>
        item.id === threadId ? { ...item, unread: false } : item,
      ),
    );
  }, []);

  const markAllRead = useCallback(() => {
    const current = getSnapshot();
    if (!current.some((thread) => thread.unread)) {
      return;
    }

    persist(current.map((thread) => ({ ...thread, unread: false })));
  }, []);

  const openThread = useCallback(
    (threadId: string) => {
      markRead(threadId);
    },
    [markRead],
  );

  return {
    threads: threadList,
    sendMessage,
    markRead,
    markAllRead,
    openThread,
  };
}
