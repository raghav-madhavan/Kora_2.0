"use client";

import Link from "next/link";
import { Clock, Heart, Mail, MapPin, Users } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { MatchExplainer } from "@/components/student/match-explainer";
import { getModeratorById } from "@/lib/mock-data";
import { getSkillEmoji, getSkillLabel } from "@/lib/skills";
import type { MatchResult } from "@/lib/matching";
import type { Shift } from "@/lib/types/student";

interface ShiftDetailSummaryProps {
  shift: Shift;
  isSaved: boolean;
  isCommitted: boolean;
  isCommitting: boolean;
  skillOverlap: number;
  matchResult?: MatchResult;
  messageThreadId?: string;
  onSave: () => void;
  onCommit: () => void;
}

export function ShiftDetailSummary({
  shift,
  isSaved,
  isCommitted,
  isCommitting,
  skillOverlap,
  matchResult,
  messageThreadId,
  onSave,
  onCommit,
}: ShiftDetailSummaryProps) {
  const moderator = getModeratorById(shift.moderatorId);
  const canCommit = !isCommitted && shift.spotsLeft > 0;

  return (
    <div className="rounded-card bg-surface p-6 shadow-card xl:sticky xl:top-24">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        Shift details
      </p>
      <p className="mt-2 text-[20px] font-bold">{shift.date}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-[14px]">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-lavender px-3 py-1.5 font-semibold">
          <Clock size={15} className="text-primary" />
          {shift.hours} hrs
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-sky px-3 py-1.5 font-semibold text-icon-sky">
          <Users size={15} />
          {shift.spotsLeft} spots left
        </span>
      </div>

      <div className="mt-4 border-t border-black/5 pt-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
          Organization
        </p>
        <Link
          href={`/organizations/${shift.orgId}`}
          className="mt-1 block text-[15px] font-semibold text-primary hover:underline"
        >
          {shift.org}
        </Link>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] text-muted">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          {shift.location}
        </p>
      </div>

      {skillOverlap > 0 ? (
        <div className="mt-4 border-t border-black/5 pt-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Skills match
          </p>
          <span className="inline-flex items-center rounded-pill bg-accent-lavender px-3 py-1 text-[12px] font-semibold text-primary">
            {skillOverlap}/{shift.skills.length} skills match your profile
          </span>
          {matchResult ? (
            <div className="mt-3">
              <MatchExplainer matchResult={matchResult} />
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {shift.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-pill bg-canvas px-3 py-1 text-[12px] font-semibold"
                >
                  <span>{getSkillEmoji(skill)}</span>
                  {getSkillLabel(skill)}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {moderator ? (
        <div className="mt-4 border-t border-black/5 pt-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Verifies your hours
          </p>
          <ModeratorRow moderator={moderator} />
          {messageThreadId ? (
            <Link
              href={`/messages?thread=${messageThreadId}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-accent-lavender py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              <Mail size={16} />
              Message moderator
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 hidden flex-col gap-3 xl:flex">
        <button
          type="button"
          onClick={onSave}
          className={`inline-flex items-center justify-center gap-2 rounded-pill border py-2.5 text-[14px] font-semibold transition ${
            isSaved
              ? "border-danger/30 bg-danger/10 text-danger"
              : "border-black/10 bg-canvas text-ink hover:bg-accent-lavender"
          }`}
        >
          <Heart
            size={17}
            className={isSaved ? "fill-danger" : ""}
            strokeWidth={2.2}
          />
          {isSaved ? "Saved" : "Save shift"}
        </button>
        <button
          type="button"
          onClick={onCommit}
          disabled={!canCommit || isCommitting}
          className={`w-full rounded-pill py-3 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isCommitted
              ? "bg-success hover:bg-success"
              : "bg-primary hover:bg-primary-deep"
          }`}
        >
          {isCommitting
            ? "Committing…"
            : isCommitted
              ? "Committed"
              : "Commit to Shift"}
        </button>
      </div>
    </div>
  );
}
