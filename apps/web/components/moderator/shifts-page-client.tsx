import Link from "next/link";
import { CalendarDays, MapPin, QrCode, Users } from "lucide-react";
import { ShiftsSidebar } from "@/components/moderator/shifts-sidebar";
import type { ModeratorShift } from "@/lib/types/moderator";

function ShiftCard({ shift }: { shift: ModeratorShift }) {
  const upcoming = shift.status === "upcoming";

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card transition hover:shadow-raised">
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shift.img}
          alt={shift.title}
          className="h-full w-full object-cover"
        />
        {!upcoming ? (
          <span className="absolute right-3 top-3 rounded-pill bg-panel/85 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
            Completed
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[16px] font-bold leading-snug">{shift.title}</h3>
        <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-muted">
          <p className="flex items-center gap-2">
            <CalendarDays size={14} strokeWidth={2.2} className="shrink-0" />
            {shift.date}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={2.2} className="shrink-0" />
            {shift.location}
          </p>
          <p className="flex items-center gap-2 font-mono text-[12px]">
            <Users size={14} strokeWidth={2.2} className="shrink-0" />
            {upcoming
              ? `${shift.committedCount}/${shift.slots} slots committed`
              : `${shift.checkedInCount}/${shift.committedCount} checked in`}
          </p>
        </div>

        {upcoming ? (
          <Link
            href={`/moderator/shifts/${shift.id}`}
            className="mt-5 flex items-center justify-center gap-2 rounded-pill bg-panel px-5 py-2.5 text-[14px] font-semibold text-cream transition hover:bg-primary-deep"
          >
            <QrCode size={16} strokeWidth={2.2} />
            Display QR
          </Link>
        ) : (
          <Link
            href={`/moderator/shifts/${shift.id}`}
            className="mt-5 flex items-center justify-center gap-2 rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            View shift
          </Link>
        )}
      </div>
    </div>
  );
}

export function ShiftsPageClient({ shifts }: { shifts: ModeratorShift[] }) {
  const upcoming = shifts
    .filter((shift) => shift.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  const completed = shifts
    .filter((shift) => shift.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold tracking-tight">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-card bg-surface px-6 py-12 text-center shadow-card">
            <CalendarDays
              size={26}
              strokeWidth={2.2}
              className="mx-auto text-muted"
            />
            <p className="mt-3 text-[15px] font-bold">No upcoming shifts</p>
            <p className="mt-1 text-[13px] text-muted">
              New shifts will appear here once scheduled.
            </p>
          </div>
        ) : (
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2">
            {upcoming.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold tracking-tight">
          Completed
        </h2>
        {completed.length === 0 ? (
          <p className="text-[14px] text-muted">No completed shifts yet.</p>
        ) : (
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2">
            {completed.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </section>
      </div>

      <ShiftsSidebar shifts={shifts} />
    </div>
  );
}
