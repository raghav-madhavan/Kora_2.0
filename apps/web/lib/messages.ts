import type { ConversationThread } from "@/lib/types/student";

export function getLastMessage(thread: ConversationThread) {
  return thread.messages[thread.messages.length - 1]!;
}

export function formatMessageTime(sentAt: string): string {
  return new Date(sentAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sortThreadsForInbox(
  threads: ConversationThread[],
): ConversationThread[] {
  return [...threads].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getPopupThreads(
  threads: ConversationThread[],
): ConversationThread[] {
  const relevant = threads.filter((thread) => thread.pinned || thread.unread);
  const pinned = relevant.filter((thread) => thread.pinned);
  const unread = relevant.filter((thread) => !thread.pinned && thread.unread);
  return [...sortThreadsForInbox(pinned), ...sortThreadsForInbox(unread)];
}

export function getSidebarPreviewThreads(
  threads: ConversationThread[],
): ConversationThread[] {
  return sortThreadsForInbox(
    threads.filter((thread) => thread.pinned || thread.unread),
  );
}

export function hasUnreadMessages(threads: ConversationThread[]): boolean {
  return threads.some((thread) => thread.unread);
}

export function getThreadPreviewLabel(thread: ConversationThread): string {
  if (thread.kind === "moderator" && thread.shiftTitle) {
    return thread.shiftTitle;
  }
  return getLastMessage(thread).body;
}
