"use client";

import { useEffect, type RefObject } from "react";
import Link from "next/link";
import { BadgeCheck, Sparkles, Target } from "lucide-react";
import {
  formatNotificationTime,
  sortNotifications,
} from "@/lib/notifications";
import { useNotificationsStore } from "@/lib/mock-notifications-store";
import type { AppNotification, NotificationKind } from "@/lib/types/student";

interface NotificationsPopupProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}

const kindConfig: Record<
  NotificationKind,
  { icon: typeof BadgeCheck; iconClass: string; bgClass: string }
> = {
  hours_verified: {
    icon: BadgeCheck,
    iconClass: "text-success",
    bgClass: "bg-accent-sky",
  },
  motivation: {
    icon: Sparkles,
    iconClass: "text-primary",
    bgClass: "bg-accent-lavender",
  },
  milestone: {
    icon: Target,
    iconClass: "text-icon-pink",
    bgClass: "bg-accent-pink",
  },
};

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const config = kindConfig[notification.kind];
  const Icon = config.icon;
  const content = (
    <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-accent-lavender/50">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${config.bgClass}`}
      >
        <Icon size={18} className={config.iconClass} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-bold">{notification.title}</p>
          {!notification.read ? (
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-danger" />
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">
          {notification.body}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={onRead}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onRead} className="w-full text-left">
      {content}
    </button>
  );
}

export function NotificationsPopup({
  open,
  onClose,
  anchorRef,
}: NotificationsPopupProps) {
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const sorted = sortNotifications(notifications);
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

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
          <p className="text-[15px] font-bold">Notifications</p>
          <p className="text-[12px] text-muted">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "Hour approvals and updates"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="max-h-[380px] overflow-y-auto p-2">
        {sorted.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted">
            No notifications yet.
          </p>
        ) : (
          sorted.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onRead={() => markRead(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
