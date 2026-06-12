"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Search, Mail, Bell } from "lucide-react";
import { MessagesPopup } from "@/components/student/messages-popup";
import { NotificationsPopup } from "@/components/student/notifications-popup";
import { StudentAvatar } from "@/components/student/student-avatar";
import { openCommandPalette } from "@/components/student/command-palette";
import { hasUnreadMessages } from "@/lib/messages";
import { hasUnreadNotifications } from "@/lib/notifications";
import { useMessagesStore } from "@/lib/mock-messages-store";
import { useNotificationsStore } from "@/lib/mock-notifications-store";
import { useStudentAvatar } from "@/lib/use-student-avatar";
import { student } from "@/lib/mock-data";

export function Topbar() {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const messagesAnchorRef = useRef<HTMLDivElement>(null);
  const notificationsAnchorRef = useRef<HTMLDivElement>(null);
  const { threads } = useMessagesStore();
  const { notifications } = useNotificationsStore();
  const avatar = useStudentAvatar();
  const unreadMessages = hasUnreadMessages(threads);
  const unreadNotifications = hasUnreadNotifications(notifications);

  return (
    <header className="relative z-50 mb-7 flex items-center gap-4">
      <button
        type="button"
        onClick={openCommandPalette}
        className="group flex h-12 flex-1 items-center gap-3 rounded-pill bg-surface px-5 text-left shadow-card transition hover:shadow-raised"
        aria-label="Open command palette to search or jump to a page"
      >
        <Search
          size={19}
          strokeWidth={2.2}
          className="shrink-0 text-muted transition group-hover:text-primary"
        />
        <span className="min-w-0 flex-1 truncate text-[15px] text-muted">
          Search or jump to…
        </span>
        <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-black/10 px-2 py-1 font-mono text-[11px] text-muted sm:flex">
          ⌘K
        </kbd>
      </button>

      <div ref={messagesAnchorRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen(false);
            setMessagesOpen((open) => !open);
          }}
          className="relative grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-surface text-ink shadow-card transition hover:text-primary"
          aria-label={unreadMessages ? "Messages, unread" : "Messages"}
          aria-expanded={messagesOpen}
        >
          <Mail size={19} strokeWidth={2.2} />
          {unreadMessages ? (
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
          ) : null}
        </button>
        <MessagesPopup
          open={messagesOpen}
          onClose={() => setMessagesOpen(false)}
          anchorRef={messagesAnchorRef}
        />
      </div>

      <div ref={notificationsAnchorRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setMessagesOpen(false);
            setNotificationsOpen((open) => !open);
          }}
          className="relative grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-surface text-ink shadow-card transition hover:text-primary"
          aria-label={
            unreadNotifications ? "Notifications, unread" : "Notifications"
          }
          aria-expanded={notificationsOpen}
        >
          <Bell size={19} strokeWidth={2.2} />
          {unreadNotifications ? (
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
          ) : null}
        </button>
        <NotificationsPopup
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          anchorRef={notificationsAnchorRef}
        />
      </div>

      <div className="mx-1 hidden h-8 w-px bg-black/5 sm:block" />

      <Link
        href="/profile"
        className="hidden cursor-pointer items-center gap-3 transition hover:opacity-80 sm:flex"
      >
        <StudentAvatar
          config={avatar}
          size={44}
          className="rounded-full bg-accent-lavender"
        />
        <div className="hidden xl:block">
          <p className="text-[15px] font-bold leading-tight">{student.name}</p>
          <p className="font-mono text-[11px] text-muted">{student.grade}</p>
        </div>
      </Link>
    </header>
  );
}
