"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CircleGauge,
  MessageSquare,
} from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { hasUnreadOrgMessages } from "@/lib/moderator-messages";
import { useModeratorMessagesStore } from "@/lib/mock-messages-store-moderator";

const nav = [
  { icon: CircleGauge, label: "Dashboard", href: "/moderator" },
  { icon: BadgeCheck, label: "Verifications", href: "/moderator/verifications" },
  { icon: CalendarDays, label: "Shifts", href: "/moderator/shifts" },
  { icon: MessageSquare, label: "Messages", href: "/moderator/messages" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { pendingCount } = useOrgLogs();
  const { threads } = useModeratorMessagesStore();
  const unreadMessages = hasUnreadOrgMessages(threads);

  return (
    <nav className="flex flex-col gap-1 pb-2">
      {nav.map(({ icon: Icon, label, href }) => {
        const active =
          href === "/moderator"
            ? pathname === "/moderator"
            : pathname.startsWith(href);
        const showPending =
          href === "/moderator/verifications" && pendingCount > 0;
        const showUnread =
          href === "/moderator/messages" && unreadMessages;

        return (
          <Link
            key={label}
            href={href}
            className={`group relative flex items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
              active
                ? "bg-panel text-cream shadow-card"
                : "text-muted hover:bg-accent-lavender/70 hover:text-ink"
            }`}
          >
            <Icon
              size={20}
              strokeWidth={2.2}
              className={`shrink-0 ${
                active ? "text-cream" : "text-muted group-hover:text-primary"
              }`}
            />
            <span className="whitespace-nowrap">{label}</span>
            {showPending ? (
              <>
                <span
                  className="ml-auto h-2 w-2 shrink-0 rounded-full bg-ember"
                  aria-hidden
                />
                <span className="sr-only">{pendingCount} pending</span>
              </>
            ) : null}
            {showUnread ? (
              <>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full bg-primary ${showPending ? "" : "ml-auto"}`}
                  aria-hidden
                />
                <span className="sr-only">Unread messages</span>
              </>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
