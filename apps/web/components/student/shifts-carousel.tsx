"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, MapPin, Users } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { rankShiftsForStudent } from "@/lib/matching";
import { getModeratorById, shifts, student, tints } from "@/lib/mock-data";

function countSkillOverlap(studentSkills: string[], shiftSkills: string[]) {
  return studentSkills.filter((s) => shiftSkills.includes(s)).length;
}

export function ShiftsCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(
    () => new Set(shifts.filter((e) => e.saved).map((e) => e.id)),
  );

  const rankedShifts = useMemo(
    () => rankShiftsForStudent(student.skills, shifts).slice(0, 4),
    [],
  );

  const toggle = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const scroll = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-bold">For You</h2>
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="text-[14px] font-semibold text-primary hover:underline"
          >
            See all
          </Link>
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-surface text-ink shadow-card transition hover:text-primary"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
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
        {rankedShifts.map((e) => {
          const tint = tints[e.categoryTint];
          const overlap = countSkillOverlap(student.skills, e.skills);
          const moderator = getModeratorById(e.moderatorId);
          return (
            <article
              key={e.id}
              className="flex w-[300px] shrink-0 flex-col rounded-card bg-surface p-3 shadow-card"
            >
              <div className="relative h-[150px] overflow-hidden rounded-2xl">
                <Image
                  src={e.img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <button
                  type="button"
                  onClick={() => toggle(e.id)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white"
                  aria-label="Save shift"
                >
                  <Heart
                    size={17}
                    className={
                      saved.has(e.id) ? "fill-danger text-danger" : "text-ink"
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
                    {e.category}
                  </span>
                  {e.matchScore > 0 ? (
                    <span className="inline-flex w-fit items-center rounded-pill bg-accent-lavender px-3 py-1 text-[11px] font-semibold text-primary">
                      {overlap}/{e.skills.length} skills match
                    </span>
                  ) : null}
                </div>
                <h3 className="text-[15px] font-bold leading-snug">
                  {e.title}
                </h3>
                <p className="mt-1 text-[13px] text-muted">{e.date}</p>

                <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3 text-[12px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {e.org}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Users size={14} /> {e.spotsLeft} left
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
