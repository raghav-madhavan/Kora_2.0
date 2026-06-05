"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, MapPin, Users } from "lucide-react";
import { shifts, tints } from "@/lib/mock-data";

export function ShiftsCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(
    () => new Set(shifts.filter((e) => e.saved).map((e) => e.id)),
  );

  const toggle = (id: number) =>
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
        <div className="flex items-center gap-2">
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
        {shifts.map((e) => {
          const tint = tints[e.categoryTint];
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
                <span
                  className={`mb-2 inline-flex w-fit items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                >
                  {e.category}
                </span>
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
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
