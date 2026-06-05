"use client";

import { useState } from "react";
import { Search, Mail, Bell } from "lucide-react";
import { MessagesPopup } from "@/components/student/messages-popup";
import { NotificationsPopup } from "@/components/student/notifications-popup";
import { hasUnreadMessages } from "@/lib/messages";
import { hasUnreadNotifications } from "@/lib/notifications";
import { useMessagesStore } from "@/lib/mock-messages-store";
import { useNotificationsStore } from "@/lib/mock-notifications-store";
import { student } from "@/lib/mock-data";

export function Topbar() {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { threads } = useMessagesStore();
  const { notifications } = useNotificationsStore();
  const unreadMessages = hasUnreadMessages(threads);
  const unreadNotifications = hasUnreadNotifications(notifications);

  return (
    <header className="relative mb-7 flex items-center gap-4">
      <div className="flex h-12 flex-1 items-center gap-3 rounded-pill bg-surface px-5 shadow-card">
        <Search size={19} className="text-muted" strokeWidth={2.2} />
        <input
          className="w-full bg-transparent text-[15px] placeholder:text-muted focus:outline-none"
          placeholder="Search events, organizations, hours…"
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen(false);
            setMessagesOpen((open) => !open);
          }}
          className="relative grid h-12 w-12 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:text-primary"
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
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setMessagesOpen(false);
            setNotificationsOpen((open) => !open);
          }}
          className="relative grid h-12 w-12 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:text-primary"
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
        />
      </div>

      <div className="mx-1 h-8 w-px bg-black/5" />

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={student.avatar}
          alt=""
          className="h-11 w-11 rounded-full bg-accent-lavender object-cover"
        />
        <div className="hidden xl:block">
          <p className="text-[15px] font-bold leading-tight">{student.name}</p>
          <p className="text-[12px] text-muted">{student.grade}</p>
        </div>
      </div>
    </header>
  );
}
