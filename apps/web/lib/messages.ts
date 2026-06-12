import type { ConversationKind, ConversationThread } from "@/lib/types/student";

export function getLastMessage(thread: ConversationThread) {
  return thread.messages[thread.messages.length - 1]!;
}

export function formatMessageTime(sentAt: string): string {
  const date = new Date(sentAt);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Unread first, then most recently updated. */
export function sortThreadsForInbox(
  threads: ConversationThread[],
): ConversationThread[] {
  return [...threads].sort((a, b) => {
    if (a.unread !== b.unread) {
      return a.unread ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function filterThreadsByKind(
  threads: ConversationThread[],
  kind: ConversationKind | "all",
): ConversationThread[] {
  if (kind === "all") {
    return threads;
  }
  return threads.filter((thread) => thread.kind === kind);
}

export function getPopupThreads(
  threads: ConversationThread[],
  limit = 5,
): ConversationThread[] {
  return sortThreadsForInbox(threads).slice(0, limit);
}

export function hasUnreadMessages(threads: ConversationThread[]): boolean {
  return threads.some((thread) => thread.unread);
}

export function getThreadPreviewLabel(thread: ConversationThread): string {
  if (thread.messages.length === 0) {
    return thread.kind === "moderator"
      ? "No messages yet — say hello"
      : "Start a conversation";
  }
  return getLastMessage(thread).body;
}

export function getThreadKindLabel(kind: ConversationKind): string {
  return kind === "moderator" ? "Moderator" : "Friend";
}
