"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { QrDisplayPanel } from "@/components/moderator/qr-display-panel";
import { VerificationRow } from "@/components/moderator/verification-row";
import type { ModeratorShift } from "@/lib/types/moderator";

interface ShiftDetailClientProps {
  shift: ModeratorShift;
  qrSession: { token: string; expiresAt: string } | null;
}

export function ShiftDetailClient({ shift, qrSession }: ShiftDetailClientProps) {
  const { logs } = useOrgLogs();
  const shiftLogs = logs.filter((log) => log.shiftId === shift.id);
  const upcoming = shift.status === "upcoming";

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/moderator/shifts"
        className="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
      >
        <ArrowLeft size={16} strokeWidth={2.4} />
        All shifts
      </Link>

      {/* Hero summary */}
      <section className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="relative h-44 sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shift.img}
            alt={shift.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute right-4 top-4 rounded-pill bg-panel/85 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
            {upcoming ? "Upcoming" : "Completed"}
          </span>
        </div>
        <div className="p-6">
          <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight">
            {shift.title}
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] text-muted">
            {shift.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
            <p className="flex items-center gap-2">
              <CalendarDays size={15} strokeWidth={2.2} className="shrink-0" />
              {shift.date}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} strokeWidth={2.2} className="shrink-0" />
              {shift.location}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 size={15} strokeWidth={2.2} className="shrink-0" />
              {shift.hours} hrs credit
            </p>
            <p className="flex items-center gap-2 font-mono text-[12px]">
              <Users size={15} strokeWidth={2.2} className="shrink-0" />
              {upcoming
                ? `${shift.committedCount}/${shift.slots} slots committed`
                : `${shift.checkedInCount}/${shift.committedCount} checked in`}
            </p>
          </div>
        </div>
      </section>

      {/* QR panel — upcoming shifts only */}
      {upcoming && qrSession ? (
        <QrDisplayPanel
          shiftId={shift.id}
          shiftTitle={shift.title}
          initialToken={qrSession.token}
          initialExpiresAt={qrSession.expiresAt}
        />
      ) : null}

      {/* Hour claims for this shift */}
      <section>
        <h3 className="mb-4 font-display text-[20px] font-semibold tracking-tight">
          Hour claims
        </h3>
        {shiftLogs.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No claims yet"
            body={
              upcoming
                ? "Claims will appear after students check in at this shift."
                : "No students submitted hours for this shift."
            }
          />
        ) : (
          <div className="stagger flex flex-col gap-4">
            {shiftLogs.map((log) => (
              <VerificationRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
