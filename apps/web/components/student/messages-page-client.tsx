"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pin, Plus, Search, Send, X } from "lucide-react";
import { PageHeader } from "@/components/student/page-header";
import {
  formatMessageTime,
  getLastMessage,
  getThreadPreviewLabel,
  sortThreadsForInbox,
} from "@/lib/messages";
import {
  friends,
  getModeratorById,
  messageTemplates,
  shifts,
  student,
} from "@/lib/mock-data";
import { useMessagesStore } from "@/lib/mock-messages-store";
import type {
  ConversationThread,
  Friend,
  Shift,
} from "@/lib/types/student";

function ThreadListItem({
  thread,
  active,
  onSelect,
}: {
  thread: ConversationThread;
  active: boolean;
  onSelect: () => void;
}) {
  const lastMessage = getLastMessage(thread);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 border-b border-black/5 px-5 py-4 text-left transition ${
        active ? "bg-accent-lavender" : "hover:bg-accent-lavender/50"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thread.contactAvatar}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full bg-accent-lavender object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-bold">{thread.contactName}</p>
          {thread.pinned ? (
            <Pin size={12} className="shrink-0 text-primary" />
          ) : null}
          {thread.unread ? (
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
        {thread.kind === "moderator" && thread.shiftTitle ? (
          <p className="mt-0.5 truncate text-[13px] font-semibold text-ink/80">
            {thread.shiftTitle}
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[12px] text-muted">
            {thread.contactSubtitle}
          </p>
        )}
        <p className="mt-1 line-clamp-2 text-[12px] text-muted">
          {getThreadPreviewLabel(thread)}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {thread.kind === "moderator" && thread.shiftDate
            ? thread.shiftDate
            : formatMessageTime(lastMessage.sentAt)}
        </p>
      </div>
    </button>
  );
}

function createFriendThread(friend: Friend): ConversationThread {
  return {
    id: `thread_friend_${friend.id.replace("friend_", "")}`,
    kind: "friend",
    pinned: false,
    unread: false,
    contactId: friend.id,
    contactName: friend.name,
    contactAvatar: friend.avatar,
    contactSubtitle: friend.role,
    messages: [],
    updatedAt: new Date().toISOString(),
  };
}

function createModeratorThread(shift: Shift): ConversationThread {
  const moderator = getModeratorById(shift.moderatorId)!;

  return {
    id: `thread_${shift.id.replace("shift_", "")}`,
    kind: "moderator",
    pinned: false,
    unread: false,
    contactId: moderator.id,
    contactName: moderator.name,
    contactAvatar: moderator.avatar,
    contactSubtitle: moderator.roleTitle,
    shiftId: shift.id,
    shiftTitle: shift.title,
    shiftDate: shift.date,
    messages: [],
    updatedAt: new Date().toISOString(),
  };
}

function getThreadIdForFriend(friend: Friend): string {
  return `thread_friend_${friend.id.replace("friend_", "")}`;
}

function getThreadIdForShift(shift: Shift): string {
  return `thread_${shift.id.replace("shift_", "")}`;
}

export function MessagesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { threads, sendMessage, openThread, upsertThread } = useMessagesStore();
  const [selectedThreadId, setSelectedThreadId] = useState(
    threads[0]?.id ?? "",
  );
  const [draft, setDraft] = useState("");
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");

  const sortedThreads = useMemo(
    () => sortThreadsForInbox(threads),
    [threads],
  );

  const pinnedThreads = sortedThreads.filter((thread) => thread.pinned);
  const recentThreads = sortedThreads.filter((thread) => !thread.pinned);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId),
    [threads, selectedThreadId],
  );

  const threadParam = searchParams.get("thread");

  useEffect(() => {
    if (!threadParam) {
      return;
    }

    if (!threads.some((thread) => thread.id === threadParam)) {
      return;
    }

    setSelectedThreadId((current) =>
      current === threadParam ? current : threadParam,
    );
    openThread(threadParam);
  }, [threadParam, threads, openThread]);

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    openThread(threadId);
    router.replace(`/messages?thread=${threadId}`, { scroll: false });
  };

  const handleSend = () => {
    if (!selectedThread || !draft.trim()) {
      return;
    }
    sendMessage(selectedThread.id, draft);
    setDraft("");
  };

  const filteredFriends = useMemo(() => {
    const query = recipientSearch.trim().toLowerCase();
    return friends.filter(
      (friend) =>
        !query ||
        friend.name.toLowerCase().includes(query) ||
        friend.role.toLowerCase().includes(query),
    );
  }, [recipientSearch]);

  const filteredModeratorShifts = useMemo(() => {
    const query = recipientSearch.trim().toLowerCase();
    return shifts.filter((shift) => {
      const moderator = getModeratorById(shift.moderatorId);
      if (!moderator) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        moderator.name.toLowerCase().includes(query) ||
        moderator.roleTitle.toLowerCase().includes(query) ||
        shift.title.toLowerCase().includes(query) ||
        shift.org.toLowerCase().includes(query)
      );
    });
  }, [recipientSearch]);

  const startFriendChat = (friend: Friend) => {
    const threadId = getThreadIdForFriend(friend);
    const existing = threads.find((thread) => thread.id === threadId);
    const thread = existing ?? createFriendThread(friend);
    if (!existing) {
      upsertThread(thread);
    }
    setNewMessageOpen(false);
    setRecipientSearch("");
    handleSelectThread(thread.id);
  };

  const startModeratorChat = (shift: Shift) => {
    const threadId = getThreadIdForShift(shift);
    const existing = threads.find((thread) => thread.id === threadId);
    const thread = existing ?? createModeratorThread(shift);
    if (!existing) {
      upsertThread(thread);
    }
    setNewMessageOpen(false);
    setRecipientSearch("");
    handleSelectThread(thread.id);
  };

  return (
    <>
      <PageHeader
        title="Messages"
        description="Chat with friends and shift moderators"
        action={
          <button
            type="button"
            onClick={() => setNewMessageOpen(true)}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
          >
            <Plus size={16} strokeWidth={2.4} />
            New Message
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          {pinnedThreads.length > 0 ? (
            <>
              <div className="border-b border-black/5 px-5 py-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Pinned
                </p>
              </div>
              {pinnedThreads.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  active={thread.id === selectedThreadId}
                  onSelect={() => handleSelectThread(thread.id)}
                />
              ))}
            </>
          ) : null}

          <div className="border-b border-black/5 px-5 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              Recent
            </p>
          </div>

          <div className="max-h-[540px] overflow-y-auto">
            {recentThreads.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-muted">
                No recent conversations.
              </p>
            ) : (
              recentThreads.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  active={thread.id === selectedThreadId}
                  onSelect={() => handleSelectThread(thread.id)}
                />
              ))
            )}
          </div>
        </div>

        {selectedThread ? (
          <div className="flex min-h-[640px] flex-col overflow-hidden rounded-card bg-surface shadow-card">
            <div className="flex items-start gap-4 border-b border-black/5 px-6 py-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedThread.contactAvatar}
                alt=""
                className="h-12 w-12 rounded-full bg-accent-lavender object-cover"
              />
              <div className="min-w-0">
                <p className="text-[16px] font-bold">
                  {selectedThread.contactName}
                </p>
                <p className="text-[13px] text-muted">
                  {selectedThread.contactSubtitle}
                </p>
                {selectedThread.kind === "moderator" &&
                selectedThread.shiftTitle ? (
                  <>
                    <p className="mt-2 text-[14px] font-semibold">
                      {selectedThread.shiftTitle}
                    </p>
                    <p className="text-[12px] text-muted">
                      {selectedThread.shiftDate}
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              {selectedThread.messages.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-muted">
                  Start the conversation below.
                </p>
              ) : (
                selectedThread.messages.map((message) => {
                  const isStudent = message.sender === "student";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          isStudent
                            ? "rounded-br-md bg-primary text-white"
                            : "rounded-bl-md bg-accent-lavender text-ink"
                        }`}
                      >
                        <p className="text-[14px] leading-relaxed">
                          {message.body}
                        </p>
                        <p
                          className={`mt-2 text-[11px] ${
                            isStudent ? "text-white/75" : "text-muted"
                          }`}
                        >
                          {formatMessageTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-black/5 px-6 py-5">
              {selectedThread.kind === "moderator" ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {messageTemplates.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setDraft(template)}
                      className="rounded-pill bg-accent-lavender px-3 py-1.5 text-left text-[12px] font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="flex items-end gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={student.avatar}
                  alt=""
                  className="hidden h-9 w-9 shrink-0 rounded-full bg-accent-lavender object-cover sm:block"
                />
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    selectedThread.kind === "moderator"
                      ? "Write a message to your moderator…"
                      : "Write a message…"
                  }
                  rows={2}
                  className="min-h-[72px] flex-1 resize-none rounded-xl border border-black/10 bg-canvas px-4 py-3 text-[14px] placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={17} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {newMessageOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-card bg-surface shadow-raised">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <div>
                <p className="text-[18px] font-bold">New Message</p>
                <p className="text-[13px] text-muted">
                  Search friends or moderators
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewMessageOpen(false);
                  setRecipientSearch("");
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-accent-lavender hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-black/5 px-6 py-4">
              <div className="flex h-11 items-center gap-3 rounded-pill bg-canvas px-4">
                <Search size={17} className="text-muted" />
                <input
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  placeholder="Search by name, shift, or organization…"
                  className="w-full bg-transparent text-[14px] placeholder:text-muted focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto px-2 py-3">
              <p className="px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                Friends
              </p>
              {filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => startFriendChat(friend)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-accent-lavender/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={friend.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full bg-accent-lavender object-cover"
                  />
                  <div>
                    <p className="text-[14px] font-bold">{friend.name}</p>
                    <p className="text-[12px] text-muted">{friend.role}</p>
                  </div>
                </button>
              ))}

              <p className="px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                Moderators
              </p>
              {filteredModeratorShifts.map((shift) => {
                const moderator = getModeratorById(shift.moderatorId);
                if (!moderator) {
                  return null;
                }
                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => startModeratorChat(shift)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-accent-lavender/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={moderator.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full bg-accent-lavender object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold">{moderator.name}</p>
                      <p className="text-[12px] text-muted">
                        {moderator.roleTitle}
                      </p>
                      <p className="truncate text-[12px] font-semibold text-ink/80">
                        {shift.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
