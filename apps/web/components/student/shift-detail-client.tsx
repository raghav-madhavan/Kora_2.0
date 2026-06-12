"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { ShiftDetailHero } from "@/components/student/shift-detail-hero";
import { ShiftDetailSummary } from "@/components/student/shift-detail-summary";
import { useMockStore } from "@/lib/mock-store";
import { useProfileStore } from "@/lib/mock-profile-store";
import { computeMatch } from "@/lib/matching";
import { useHoursOptional } from "@/components/student/hours-provider";
import { getThreadIdForShift } from "@/lib/shifts";
import type { Shift } from "@/lib/types/student";

interface ShiftDetailClientProps {
  shift: Shift;
}

function countSkillOverlap(studentSkills: string[], shiftSkills: string[]) {
  return studentSkills.filter((s) => shiftSkills.includes(s)).length;
}

export function ShiftDetailClient({ shift: initialShift }: ShiftDetailClientProps) {
  const store = useMockStore();
  const { skills } = useProfileStore();
  const hoursCtx = useHoursOptional();
  const [isCommitting, startCommitTransition] = useTransition();
  const [justCommitted, setJustCommitted] = useState(false);

  const shift = useMemo(() => {
    const live = store.getShifts().find((s) => s.id === initialShift.id);
    return live ?? initialShift;
  }, [store, initialShift]);

  const categoryGaps = hoursCtx?.categoryGaps;

  const matchResult = useMemo(
    () => computeMatch(skills, shift, categoryGaps),
    [skills, shift, categoryGaps],
  );

  const isSaved = store.isSaved(shift.id);
  const isCommitted = store.isCommitted(shift.id);
  const skillOverlap = countSkillOverlap(skills, shift.skills);
  const messageThreadId = getThreadIdForShift(shift.id);
  const canCommit = !isCommitted && shift.spotsLeft > 0;

  const handleSave = () => {
    store.toggleSavedShift(shift.id);
  };

  const handleCommit = () => {
    startCommitTransition(() => {
      const ok = store.commitToShift(shift.id);
      if (ok) {
        setJustCommitted(true);
        window.setTimeout(() => setJustCommitted(false), 2000);
      }
    });
  };

  return (
    <div className="pb-24 xl:pb-12">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <ShiftDetailHero shift={shift} />

          <section className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="text-[18px] font-bold">About this shift</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/85">
              {shift.description}
            </p>
          </section>

          <section className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="text-[18px] font-bold">What to bring</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {shift.whatToBring.map((item) => (
                <span
                  key={item}
                  className="rounded-pill bg-accent-lavender px-4 py-2 text-[13px] font-semibold text-ink"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        <ShiftDetailSummary
          shift={shift}
          isSaved={isSaved}
          isCommitted={isCommitted || justCommitted}
          isCommitting={isCommitting}
          skillOverlap={skillOverlap}
          matchResult={matchResult}
          messageThreadId={messageThreadId}
          onSave={handleSave}
          onCommit={handleCommit}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/5 bg-surface/95 p-4 backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-shell items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black/10 bg-canvas"
            aria-label={isSaved ? "Unsave shift" : "Save shift"}
          >
            <Heart
              size={20}
              className={`transition-transform ${isSaved ? "scale-110 fill-danger text-danger" : "text-ink"}`}
              strokeWidth={2.2}
            />
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={!canCommit || isCommitting}
            className={`flex-1 rounded-pill py-3 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isCommitted || justCommitted
                ? "bg-success"
                : "bg-primary hover:bg-primary-deep"
            }`}
          >
            {isCommitting
              ? "Committing…"
              : isCommitted || justCommitted
                ? "Committed"
                : "Commit to Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
