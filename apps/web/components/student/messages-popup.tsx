"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Pin } from "lucide-react";
import {
  formatMessageTime,
  getLastMessage,
  getPopupThreads,
  getThreadPreviewLabel,
  hasUnreadMessages,
} from "@/lib/messages";
import { useMessagesStore } from "@/lib/mock-messages-store";
import type { ConversationThread } from "@/lib/types/student";

interface MessagesPopupProps {
  open: boolean;
  onClose: () => void;
}

function PopupThreadRow({
  thread,
  onOpen,
}: {
  thread: ConversationThread;
  onOpen: (threadId: string) => void;
}) {
  const lastMessage = getLastMessage(thread);

  return (
    <Link
      href={`/messages?thread=${thread.id}`}
      onClick={() => onOpen(thread.id)}
      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-accent-lavender/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thread.contactAvatar}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full bg-accent-lavender object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-bold">{thread.contactName}</p>
          {thread.pinned ? (
            <Pin size={12} className="shrink-0 text-primary" />
          ) : null}
          {thread.unread ? (
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
        {thread.kind === "moderator" && thread.shiftTitle ? (
          <p className="truncate text-[12px] font-semibold text-ink/80">
            {thread.shiftTitle}
          </p>
        ) : null}
        <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">
          {getThreadPreviewLabel(thread)}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {formatMessageTime(lastMessage.sentAt)}
        </p>
      </div>
    </Link>
  );
}

export function MessagesPopup({ open, onClose }: MessagesPopupProps) {
  const { threads, markRead, markAllRead } = useMessagesStore();
  const popupRef = useRef<HTMLDivElement>(null);
  const popupThreads = getPopupThreads(threads);
  const unread = hasUnreadMessages(threads);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] overflow-hidden rounded-card bg-surface shadow-raised"
    >
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <div>
          <p className="text-[15px] font-bold">Messages</p>
          <p className="text-[12px] text-muted">
            {unread ? "Pinned and new" : "Pinned conversations"}
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
            href="/messages"
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
            No pinned or unread messages.
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
