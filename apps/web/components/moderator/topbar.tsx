"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bell, Mail, Search } from "lucide-react";
import { openModeratorCommandPalette } from "@/components/moderator/command-palette";
import { MessagesPopup } from "@/components/moderator/messages-popup";
import { NotificationsPopup } from "@/components/moderator/notifications-popup";
import { useModeratorSession } from "@/components/moderator/session-provider";
import { isModeratorPathAllowed } from "@/lib/auth/policy";
import { hasUnreadOrgMessages } from "@/lib/moderator-messages";
import { useModeratorMessagesStore } from "@/lib/mock-messages-store-moderator";
import { useModeratorNotificationsStore } from "@/lib/mock-notifications-store-moderator";

export function Topbar() {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const messagesAnchorRef = useRef<HTMLDivElement>(null);
  const notificationsAnchorRef = useRef<HTMLDivElement>(null);
  const { threads } = useModeratorMessagesStore();
  const { notifications } = useModeratorNotificationsStore();
  const unreadMessages = hasUnreadOrgMessages(threads);
  const unreadNotifications = notifications.some(
    (notification) => !notification.read,
  );
  const { session, persona } = useModeratorSession();
  const canSearch = isModeratorPathAllowed(session, "/moderator/search");
  const canMessage = isModeratorPathAllowed(session, "/moderator/messages");

  const profileContent = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={persona.avatar}
        alt={persona.name}
        className="h-11 w-11 rounded-full bg-accent-sky object-cover shadow-card"
      />
      <div className="hidden xl:block">
        <p className="text-[15px] font-bold leading-tight">
          {persona.name}
        </p>
        <p className="font-mono text-[11px] text-muted">
          {persona.roleTitle}
        </p>
      </div>
    </>
  );

  return (
    <header className="relative z-50 mb-7 flex items-center gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h2 className="truncate font-display text-[22px] font-semibold tracking-tight">
          {persona.orgName}
        </h2>
        <span className="flex shrink-0 items-center gap-1.5 rounded-pill bg-accent-sky px-3 py-1.5 text-[12px] font-semibold text-icon-sky">
          <BadgeCheck size={14} strokeWidth={2.4} />
          Verified org
        </span>
        <span className="hidden shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/80 sm:inline">
          {session.access === "macro" ? "Org moderator" : "Shift moderator"}
        </span>
      </div>

      {canSearch ? (
        <button
          type="button"
          onClick={openModeratorCommandPalette}
          className="group flex h-12 shrink-0 items-center gap-2.5 rounded-pill bg-surface px-4 shadow-card transition hover:shadow-raised sm:px-5"
          aria-label="Open command palette to search or jump to a page"
        >
          <Search
            size={19}
            strokeWidth={2.2}
            className="shrink-0 text-muted transition group-hover:text-primary"
          />
          <span className="hidden text-[15px] text-muted md:inline">
            Search or jump to…
          </span>
          <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-black/10 px-2 py-1 font-mono text-[11px] text-muted md:flex">
            ⌘K
          </kbd>
        </button>
      ) : null}

      {canMessage ? (
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
      ) : null}

      {session.access === "macro" ? (
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
      ) : null}

      <div className="mx-1 hidden h-8 w-px bg-black/5 sm:block" />

      {isModeratorPathAllowed(session, "/moderator/profile") ? (
        <Link
          href="/moderator/profile"
          className="hidden shrink-0 items-center gap-3 transition hover:opacity-80 sm:flex"
          aria-label="Open your profile"
        >
          {profileContent}
        </Link>
      ) : (
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {profileContent}
        </div>
      )}
    </header>
  );
}
