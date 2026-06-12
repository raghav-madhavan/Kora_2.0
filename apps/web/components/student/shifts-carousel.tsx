"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, MapPin, Users } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { MatchBadge } from "@/components/student/match-badge";
import { rankShiftsForStudent } from "@/lib/matching";
import { getModeratorById, tints } from "@/lib/mock-data";
import { useMockStore } from "@/lib/mock-store";
import { useProfileStore } from "@/lib/mock-profile-store";
import { useHoursOptional } from "@/components/student/hours-provider";
export function ShiftsCarousel() {
  const { skills } = useProfileStore();
  const store = useMockStore();
  const hoursCtx = useHoursOptional();
  const scroller = useRef<HTMLDivElement>(null);
  const categoryGaps = hoursCtx?.categoryGaps;

  const rankedShifts = useMemo(
    () =>
      rankShiftsForStudent(skills, store.getShifts(), { categoryGaps }).slice(
        0,
        4,
      ),
    [skills, store, categoryGaps],
  );

  const scroll = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[20px] font-semibold tracking-tight">
          For You
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/events?tab=for-you"
            className="text-[14px] font-semibold text-primary hover:underline"
          >
            See all
          </Link>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:text-primary"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-raised transition hover:bg-primary-deep"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-1"
      >
        {rankedShifts.map((shift, index) => {
          const tint = tints[shift.categoryTint];
          const moderator = getModeratorById(shift.moderatorId);
          const isSaved = store.isSaved(shift.id);
          const detailHref = `/events/${shift.id}`;

          return (
            <article
              key={shift.id}
              className="flex w-[300px] shrink-0 flex-col rounded-card bg-surface p-3 shadow-card transition hover:shadow-raised"
            >
              <div className="relative h-[150px] overflow-hidden rounded-2xl">
                <Link href={detailHref} className="absolute inset-0">
                  <Image
                    src={shift.img}
                    alt={shift.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                    priority={index === 0}
                  />
                </Link>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    store.toggleSavedShift(shift.id);
                  }}
                  className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white"
                  aria-label="Save shift"
                >
                  <Heart
                    size={17}
                    className={
                      isSaved ? "fill-danger text-danger" : "text-ink"
                    }
                    strokeWidth={2.2}
                  />
                </button>
              </div>

              <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex w-fit items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                  >
                    {shift.category}
                  </span>
                  <MatchBadge
                    matchScore={shift.matchScore}
                    matchingSkillsCount={shift.matchingSkills.length}
                  />
                </div>
                <Link href={detailHref} className="group">
                  <h3 className="text-[15px] font-bold leading-snug group-hover:text-primary">
                    {shift.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-muted">{shift.date}</p>
                </Link>

                <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3 text-[12px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {shift.org}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Users size={14} /> {shift.spotsLeft} left
                  </span>
                </div>

                {moderator ? (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Verifies your hours
                    </p>
                    <ModeratorRow moderator={moderator} compact />
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
