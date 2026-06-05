"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { getSidebarPreviewThreads, hasUnreadMessages } from "@/lib/messages";
import { useMessagesStore } from "@/lib/mock-messages-store";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-7 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
      {children}
    </p>
  );
}

export function SidebarMessagesSection() {
  const pathname = usePathname();
  const { threads, markRead } = useMessagesStore();
  const previewThreads = getSidebarPreviewThreads(threads);
  const active = pathname.startsWith("/messages");
  const unread = hasUnreadMessages(threads);

  return (
    <>
      <SectionLabel>Messages</SectionLabel>
      <Link
        href="/messages"
        className={`relative mb-3 flex items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-medium transition ${
          active
            ? "bg-accent-lavender text-ink"
            : "text-muted hover:bg-accent-lavender/50 hover:text-ink"
        }`}
      >
        <Mail
          size={20}
          strokeWidth={2.2}
          className={
            active ? "text-primary" : "text-muted group-hover:text-primary"
          }
        />
        Messages
        {unread ? (
          <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
        ) : null}
      </Link>

      <div className="flex flex-col gap-3 px-1">
        {previewThreads.map((thread) => (
          <Link
            key={thread.id}
            href={`/messages?thread=${thread.id}`}
            onClick={() => markRead(thread.id)}
            className="flex items-center gap-3 rounded-chip px-1 py-1 transition hover:bg-accent-lavender/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thread.contactAvatar}
              alt=""
              className="h-9 w-9 rounded-full bg-accent-lavender object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[14px] font-semibold">
                  {thread.contactName}
                </p>
                {thread.unread ? (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
                ) : null}
              </div>
              <p className="truncate text-[12px] text-muted">
                {thread.kind === "moderator" && thread.shiftTitle
                  ? thread.shiftTitle
                  : thread.contactSubtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
