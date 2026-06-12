import type { OrgInboxThread } from "@/lib/types/moderator";

export { formatMessageTime } from "@/lib/messages";

export function getOrgLastMessage(thread: OrgInboxThread) {
  return thread.messages[thread.messages.length - 1]!;
}

export function sortOrgThreadsForInbox(
  threads: OrgInboxThread[],
): OrgInboxThread[] {
  return [...threads].sort((a, b) => {
    if (a.unread !== b.unread) {
      return a.unread ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getOrgThreadPreview(thread: OrgInboxThread): string {
  if (thread.messages.length === 0) {
    return "No messages yet";
  }
  return getOrgLastMessage(thread).body;
}

export function hasUnreadOrgMessages(threads: OrgInboxThread[]): boolean {
  return threads.some((thread) => thread.unread);
}

export function getOrgPopupThreads(
  threads: OrgInboxThread[],
  limit = 5,
): OrgInboxThread[] {
  return sortOrgThreadsForInbox(threads).slice(0, limit);
}
