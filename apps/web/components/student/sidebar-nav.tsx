"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleGauge,
  CalendarSearch,
  CalendarDays,
  Clock,
  Target,
  Building2,
  ScanLine,
  Mail,
} from "lucide-react";
import { hasUnreadMessages } from "@/lib/messages";
import { useMessagesStore } from "@/lib/mock-messages-store";

const nav = [
  { icon: CircleGauge, label: "Dashboard", href: "/", hotkey: "d" },
  { icon: CalendarSearch, label: "Events", href: "/events", hotkey: "e" },
  { icon: CalendarDays, label: "Schedule", href: "/schedule", hotkey: "s" },
  { icon: ScanLine, label: "Log Hours", href: "/log-hours", hotkey: "l" },
  { icon: Clock, label: "My Hours", href: "/hours", hotkey: "h" },
  { icon: Target, label: "Goals", href: "/goals", hotkey: "g" },
  { icon: Building2, label: "Organizations", href: "/organizations", hotkey: "o" },
  { icon: Mail, label: "Messages", href: "/messages", hotkey: "m" },
];

const SIDEBAR_EASE =
  "duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]";

function sidebarFade(collapsed: boolean) {
  return collapsed
    ? "max-w-0 opacity-0 delay-0 duration-300 ease-in"
    : "max-w-[200px] opacity-100 delay-100 duration-500 ease-out";
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { threads } = useMessagesStore();
  const unreadMessages = hasUnreadMessages(threads);

  return (
    <nav className="flex flex-col gap-1 pb-2">
      {nav.map(({ icon: Icon, label, href, hotkey }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        const showUnread = href === "/messages" && unreadMessages;

        return (
          <Link
            key={label}
            href={href}
            title={collapsed ? label : undefined}
            className={`group relative flex items-center rounded-chip py-2.5 text-[15px] font-medium transition-all ${SIDEBAR_EASE} ${
              collapsed ? "justify-center px-2.5" : "gap-3 px-3"
            } ${
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
            <span
              className={`inline-block overflow-hidden whitespace-nowrap transition-[max-width,opacity] ${sidebarFade(collapsed)}`}
            >
              {label}
            </span>
            {!collapsed && !active ? (
              <kbd
                className={`ml-auto shrink-0 rounded-md border border-black/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                  showUnread ? "hidden" : ""
                }`}
              >
                g&thinsp;{hotkey}
              </kbd>
            ) : null}
            {showUnread ? (
              <span
                className={`h-2 w-2 shrink-0 rounded-full bg-ember transition-all ${SIDEBAR_EASE} ${
                  collapsed ? "absolute right-2 top-2" : "ml-auto"
                }`}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
