"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  CircleGauge,
  MessageSquare,
  MoreHorizontal,
  QrCode,
} from "lucide-react";
import { MobileMoreSheet } from "@/components/moderator/mobile-more-sheet";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { hasUnreadOrgMessages } from "@/lib/moderator-messages";
import { useModeratorMessagesStore } from "@/lib/mock-messages-store-moderator";
import { moderatorShifts } from "@/lib/mock-data-moderator";

const nextUpcomingShift = [...moderatorShifts]
  .filter((shift) => shift.status === "upcoming")
  .sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )[0];

const showQrHref = nextUpcomingShift
  ? `/moderator/shifts/${nextUpcomingShift.id}`
  : "/moderator/shifts";

export function MobileNav() {
  const pathname = usePathname();
  const { pendingCount } = useOrgLogs();
  const { threads } = useModeratorMessagesStore();
  const unreadMessages = hasUnreadOrgMessages(threads);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-surface/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-shell items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
          <Link
            href="/moderator"
            className={`flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold transition ${
              pathname === "/moderator" ? "text-primary" : "text-muted"
            }`}
          >
            <CircleGauge
              size={20}
              strokeWidth={pathname === "/moderator" ? 2.4 : 2}
            />
            Home
          </Link>

          <Link
            href="/moderator/verifications"
            className={`relative flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold transition ${
              pathname.startsWith("/moderator/verifications")
                ? "text-primary"
                : "text-muted"
            }`}
          >
            <span className="relative">
              <BadgeCheck
                size={20}
                strokeWidth={
                  pathname.startsWith("/moderator/verifications") ? 2.4 : 2
                }
              />
              {pendingCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-ember ring-2 ring-surface"
                  aria-hidden
                />
              ) : null}
            </span>
            Verify
            {pendingCount > 0 ? (
              <span className="sr-only">, {pendingCount} pending</span>
            ) : null}
          </Link>

          <Link
            href={showQrHref}
            className={`-mt-4 flex min-w-[56px] flex-col items-center gap-1 text-[10px] font-semibold transition ${
              pathname.startsWith(showQrHref) ? "text-primary" : "text-muted"
            }`}
          >
            <span
              className={`grid h-14 w-14 place-items-center rounded-full shadow-raised transition active:scale-[0.97] ${
                pathname.startsWith(showQrHref)
                  ? "bg-primary"
                  : "bg-panel hover:bg-primary-deep"
              }`}
            >
              <QrCode size={24} strokeWidth={2.2} className="text-cream" />
            </span>
            Show QR
          </Link>

          <Link
            href="/moderator/messages"
            className={`relative flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold transition ${
              pathname.startsWith("/moderator/messages")
                ? "text-primary"
                : "text-muted"
            }`}
          >
            <span className="relative">
              <MessageSquare
                size={20}
                strokeWidth={
                  pathname.startsWith("/moderator/messages") ? 2.4 : 2
                }
              />
              {unreadMessages ? (
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-surface"
                  aria-hidden
                />
              ) : null}
            </span>
            Messages
          </Link>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold text-muted transition hover:text-ink"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
            More
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
