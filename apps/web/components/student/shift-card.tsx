"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Users } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { MatchBadge } from "@/components/student/match-badge";
import { getModeratorById, tints } from "@/lib/mock-data";
import type { MatchResult } from "@/lib/matching";
import type { Shift } from "@/lib/types/student";

interface ShiftCardProps {
  shift: Shift;
  isSaved: boolean;
  isCommitted: boolean;
  /** Pass the full MatchResult from rankShiftsForStudent */
  matchResult?: MatchResult;
  /** Legacy scalar — used if matchResult is not provided */
  matchScore?: number;
  skillOverlap?: number;
  onSave: (shiftId: string) => void;
  onCommit: (shiftId: string) => void;
}

export function ShiftCard({
  shift,
  isSaved,
  isCommitted,
  matchResult,
  matchScore: matchScoreProp,
  onSave,
  onCommit,
}: ShiftCardProps) {
  const tint = tints[shift.categoryTint];
  const canCommit = !isCommitted && shift.spotsLeft > 0;
  const moderator = getModeratorById(shift.moderatorId);
  const detailHref = `/events/${shift.id}`;

  const effectiveMatchScore = matchResult?.matchScore ?? matchScoreProp ?? 0;
  const effectiveMatchingCount = matchResult?.matchingSkills.length;

  return (
    <article className="flex flex-col rounded-card bg-surface p-3 shadow-card transition hover:shadow-raised">
      <div className="relative h-[150px] overflow-hidden rounded-2xl">
        <Link href={detailHref} className="absolute inset-0">
          <Image
            src={shift.img}
            alt={shift.title}
            fill
            className="object-cover transition hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(shift.id);
          }}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white"
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
          <MatchBadge
            matchScore={effectiveMatchScore}
            matchingSkillsCount={effectiveMatchingCount}
          />
        </div>

        <Link href={detailHref} className="group">
          <h3 className="text-[15px] font-bold leading-snug group-hover:text-primary">
            {shift.title}
          </h3>
          <p className="mt-1 text-[13px] text-muted">{shift.date}</p>
          <p className="mt-2 line-clamp-2 text-[12px] text-muted/90">
            {shift.description}
          </p>
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
