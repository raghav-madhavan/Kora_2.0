"use client";

import { useEffect, type RefObject } from "react";
import Link from "next/link";
import {
  formatMessageTime,
  getOrgLastMessage,
  getOrgPopupThreads,
  getOrgThreadPreview,
  hasUnreadOrgMessages,
} from "@/lib/moderator-messages";
import { useModeratorMessagesStore } from "@/lib/mock-messages-store-moderator";
import type { OrgInboxThread } from "@/lib/types/moderator";

interface MessagesPopupProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}

function PopupThreadRow({
  thread,
  onOpen,
}: {
  thread: OrgInboxThread;
  onOpen: (threadId: string) => void;
}) {
  const lastMessage =
    thread.messages.length > 0 ? getOrgLastMessage(thread) : null;
  const timeLabel = lastMessage
    ? formatMessageTime(lastMessage.sentAt)
    : formatMessageTime(thread.updatedAt);

  return (
    <Link
      href={`/moderator/messages?thread=${thread.id}`}
      onClick={() => onOpen(thread.id)}
      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-accent-lavender/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thread.studentAvatar}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full bg-accent-lavender object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-bold">{thread.studentName}</p>
          <span className="shrink-0 text-[11px] text-muted">{timeLabel}</span>
        </div>
        <p className="truncate text-[11px] font-semibold text-primary">
          {thread.shiftTitle}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[12px] text-muted">
            {getOrgThreadPreview(thread)}
          </p>
          {thread.unread ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function MessagesPopup({
  open,
  onClose,
  anchorRef,
}: MessagesPopupProps) {
  const { threads, markRead, markAllRead } = useModeratorMessagesStore();
  const popupThreads = getOrgPopupThreads(threads);
  const unread = hasUnreadOrgMessages(threads);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (anchorRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) {
    return null;
  }

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] overflow-hidden rounded-card bg-surface shadow-raised">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <div>
          <p className="text-[15px] font-bold">Student messages</p>
          <p className="text-[12px] text-muted">
            {unread ? "Unread conversations" : "Recent conversations"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unread ? (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : null}
          <Link
            href="/moderator/messages"
            onClick={onClose}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto p-2">
        {popupThreads.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted">
            No student messages yet.
          </p>
        ) : (
          popupThreads.map((thread) => (
            <PopupThreadRow
              key={thread.id}
              thread={thread}
              onOpen={markRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
