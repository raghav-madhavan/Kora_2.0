"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, MessageSquare, QrCode } from "lucide-react";
import {
  formatMessageTime,
  getOrgPopupThreads,
  getOrgThreadPreview,
} from "@/lib/moderator-messages";
import { useModeratorMessagesStore } from "@/lib/mock-messages-store-moderator";
import type { ModeratorShift } from "@/lib/types/moderator";

export function ShiftsSidebar({ shifts }: { shifts: ModeratorShift[] }) {
  const { threads } = useModeratorMessagesStore();
  const upcoming = shifts.filter((s) => s.status === "upcoming");
  const completed = shifts.filter((s) => s.status === "completed");
  const nextShift = [...upcoming].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )[0];
  const totalCommitted = upcoming.reduce((sum, s) => sum + s.committedCount, 0);
  const totalSlots = upcoming.reduce((sum, s) => sum + s.slots, 0);
  const recentMessages = getOrgPopupThreads(threads, 3);

  return (
    <aside className="flex flex-col gap-5 xl:sticky xl:top-7 xl:self-start">
      <div className="rounded-card bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[18px] font-semibold tracking-tight">
            Shift overview
          </h3>
          <CalendarDays size={18} strokeWidth={2.2} className="text-muted" />
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">
              Upcoming
            </dt>
            <dd className="mt-1 font-display text-[28px] font-semibold leading-none">
              {upcoming.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">
              Completed
            </dt>
            <dd className="mt-1 font-display text-[28px] font-semibold leading-none">
              {completed.length}
            </dd>
          </div>
        </dl>
        {upcoming.length > 0 ? (
          <p className="mt-4 font-mono text-[12px] text-muted">
            {totalCommitted}/{totalSlots} slots filled across upcoming shifts
          </p>
        ) : null}
        {nextShift ? (
          <Link
            href={`/moderator/shifts/${nextShift.id}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-pill bg-panel px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:bg-primary-deep"
          >
            <QrCode size={15} strokeWidth={2.2} />
            Display next check-in QR
          </Link>
        ) : null}
      </div>

      <div className="rounded-card bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[18px] font-semibold tracking-tight">
            Student messages
          </h3>
          <Link
            href="/moderator/messages"
            className="text-muted transition hover:text-primary"
            aria-label="View all messages"
          >
            <ArrowUpRight size={18} strokeWidth={2.2} />
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <p className="text-[13px] text-muted">No messages yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/5">
            {recentMessages.map((thread) => (
              <li key={thread.id}>
                <Link
                  href={`/moderator/messages?thread=${thread.id}`}
                  className="flex items-start gap-3 py-3 transition hover:opacity-80 first:pt-0 last:pb-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thread.studentAvatar}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full bg-accent-lavender object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[13px] font-bold">
                        {thread.studentName}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted">
                        {formatMessageTime(thread.updatedAt)}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-semibold text-primary">
                      {thread.shiftTitle}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted">
                      {getOrgThreadPreview(thread)}
                    </p>
                  </div>
                  {thread.unread ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/moderator/messages"
          className="mt-4 flex items-center justify-center gap-2 rounded-pill bg-accent-lavender px-4 py-2 text-[13px] font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          <MessageSquare size={14} strokeWidth={2.2} />
          Open inbox
        </Link>
      </div>
    </aside>
  );
}
