"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { conversationThreads as seedThreads } from "@/lib/mock-data";
import type { ChatMessage, ConversationThread } from "@/lib/types/student";

const STORAGE_KEY = "kora-messages-store-v1";

function cloneSeedThreads(): ConversationThread[] {
  return seedThreads.map((thread) => ({ ...thread }));
}

function loadThreads(): ConversationThread[] {
  if (typeof window === "undefined") {
    return cloneSeedThreads();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneSeedThreads();
    }
    return JSON.parse(raw) as ConversationThread[];
  } catch {
    return cloneSeedThreads();
  }
}

function saveThreads(threads: ConversationThread[]): void {
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

function getSnapshot(): ConversationThread[] {
  return threads;
}

function getServerSnapshot(): ConversationThread[] {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: ConversationThread[]): void {
  threads = next;
  saveThreads(next);
  emitChange();
}

export function useMessagesStore() {
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
      id: `msg_${threadId}_${Date.now()}`,
      sender: "student",
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

  const openThread = useCallback((threadId: string) => {
    markRead(threadId);
  }, [markRead]);

  const upsertThread = useCallback((thread: ConversationThread) => {
    const current = getSnapshot();
    const exists = current.some((item) => item.id === thread.id);
    persist(
      exists
        ? current.map((item) => (item.id === thread.id ? thread : item))
        : [thread, ...current],
    );
  }, []);

  return {
    threads: threadList,
    sendMessage,
    markRead,
    markAllRead,
    openThread,
    upsertThread,
  };
}
