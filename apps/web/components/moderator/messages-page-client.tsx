"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/student/page-header";
import {
  formatMessageTime,
  getOrgLastMessage,
  getOrgThreadPreview,
  sortOrgThreadsForInbox,
} from "@/lib/moderator-messages";
import {
  currentModerator,
  moderatorMessageTemplates,
} from "@/lib/mock-data-moderator";
import { useModeratorMessagesStore } from "@/lib/mock-messages-store-moderator";
import type { OrgInboxThread } from "@/lib/types/moderator";

function ThreadListItem({
  thread,
  active,
  onSelect,
}: {
  thread: OrgInboxThread;
  active: boolean;
  onSelect: () => void;
}) {
  const lastMessage =
    thread.messages.length > 0 ? getOrgLastMessage(thread) : null;
  const timeLabel = lastMessage
    ? formatMessageTime(lastMessage.sentAt)
    : formatMessageTime(thread.updatedAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition ${
        active
          ? "bg-accent-lavender"
          : "border-b border-black/5 hover:bg-accent-lavender/40"
      }`}
    >
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thread.studentAvatar}
          alt=""
          className="h-11 w-11 rounded-full bg-accent-lavender object-cover"
        />
        {thread.unread ? (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={`truncate text-[14px] ${thread.unread ? "font-bold" : "font-semibold"}`}
          >
            {thread.studentName}
          </p>
          <span className="shrink-0 text-[11px] text-muted">{timeLabel}</span>
        </div>
        <p className="mt-0.5 truncate text-[12px] font-semibold text-primary">
          {thread.shiftTitle}
        </p>
        <p
          className={`mt-1 truncate text-[12px] ${thread.unread ? "font-medium text-ink" : "text-muted"}`}
        >
          {getOrgThreadPreview(thread)}
        </p>
      </div>
    </button>
  );
}

export function MessagesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { threads, sendMessage, openThread } = useModeratorMessagesStore();
  const [selectedThreadId, setSelectedThreadId] = useState(
    threads[0]?.id ?? "",
  );
  const [draft, setDraft] = useState("");

  const inboxThreads = useMemo(
    () => sortOrgThreadsForInbox(threads),
    [threads],
  );

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
    router.replace(`/moderator/messages?thread=${threadId}`, { scroll: false });
  };

  const handleSend = () => {
    if (!selectedThread || !draft.trim()) {
      return;
    }
    sendMessage(selectedThread.id, draft);
    setDraft("");
  };

  return (
    <>
      <PageHeader
        title="Messages"
        description="Reply to students about your shifts and hour claims."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card">
          <div className="border-b border-black/5 px-5 py-4">
            <p className="text-[14px] font-bold">Student inbox</p>
            <p className="text-[12px] text-muted">
              {inboxThreads.filter((t) => t.unread).length} unread
            </p>
          </div>
          <div className="max-h-[580px] overflow-y-auto">
            {inboxThreads.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-muted">
                No student messages yet.
              </p>
            ) : (
              inboxThreads.map((thread) => (
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
                src={selectedThread.studentAvatar}
                alt=""
                className="h-12 w-12 rounded-full bg-accent-lavender object-cover"
              />
              <div className="min-w-0">
                <p className="text-[16px] font-bold">
                  {selectedThread.studentName}
                </p>
                <p className="text-[13px] text-muted">{selectedThread.school}</p>
                <p className="mt-2 text-[14px] font-semibold">
                  {selectedThread.shiftTitle}
                </p>
                <p className="text-[12px] text-muted">
                  {selectedThread.shiftDate}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              {selectedThread.messages.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-muted">
                  Start the conversation below.
                </p>
              ) : (
                selectedThread.messages.map((message) => {
                  const isModerator = message.sender === "moderator";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isModerator ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          isModerator
                            ? "rounded-br-md bg-primary text-white"
                            : "rounded-bl-md bg-accent-lavender text-ink"
                        }`}
                      >
                        <p className="text-[14px] leading-relaxed">
                          {message.body}
                        </p>
                        <p
                          className={`mt-2 text-[11px] ${
                            isModerator ? "text-white/75" : "text-muted"
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
              <div className="mb-3 flex flex-wrap gap-2">
                {moderatorMessageTemplates.map((template) => (
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

              <div className="flex items-end gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentModerator.avatar}
                  alt=""
                  className="hidden h-9 w-9 shrink-0 rounded-full bg-accent-sky object-cover sm:block"
                />
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a reply to this student…"
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
        ) : (
          <div className="flex min-h-[640px] items-center justify-center rounded-card bg-surface px-6 shadow-card">
            <p className="text-center text-[14px] text-muted">
              Select a conversation to reply.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
