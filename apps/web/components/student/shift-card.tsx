"use client";

import Image from "next/image";
import { Heart, MapPin, Users } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { getModeratorById, tints } from "@/lib/mock-data";
import type { Shift } from "@/lib/types/student";

interface ShiftCardProps {
  shift: Shift;
  isSaved: boolean;
  isCommitted: boolean;
  matchScore?: number;
  skillOverlap?: number;
  onSave: (shiftId: string) => void;
  onCommit: (shiftId: string) => void;
}

export function ShiftCard({
  shift,
  isSaved,
  isCommitted,
  matchScore,
  skillOverlap,
  onSave,
  onCommit,
}: ShiftCardProps) {
  const tint = tints[shift.categoryTint];
  const canCommit = !isCommitted && shift.spotsLeft > 0;
  const moderator = getModeratorById(shift.moderatorId);

  return (
    <article className="flex flex-col rounded-card bg-surface p-3 shadow-card">
      <div className="relative h-[150px] overflow-hidden rounded-2xl">
        <Image
          src={shift.img}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <button
          type="button"
          onClick={() => onSave(shift.id)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white"
          aria-label="Save shift"
        >
          <Heart
            size={17}
            className={isSaved ? "fill-danger text-danger" : "text-ink"}
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
          {matchScore !== undefined && matchScore > 0 && skillOverlap !== undefined ? (
            <span className="inline-flex w-fit items-center rounded-pill bg-accent-lavender px-3 py-1 text-[11px] font-semibold text-primary">
              {skillOverlap}/{shift.skills.length} skills match
            </span>
          ) : null}
        </div>

        <h3 className="text-[15px] font-bold leading-snug">{shift.title}</h3>
        <p className="mt-1 text-[13px] text-muted">{shift.date}</p>
        <p className="mt-2 line-clamp-2 text-[12px] text-muted/90">
          {shift.description}
        </p>

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

        <button
          type="button"
          onClick={() => onCommit(shift.id)}
          disabled={!canCommit}
          className="mt-4 w-full rounded-pill bg-primary py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCommitted ? "Committed" : "Commit to Shift"}
        </button>
      </div>
    </article>
  );
}
