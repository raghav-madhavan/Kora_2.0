"use client";

import { Check, ShieldCheck, UserPlus } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { getModeratorById, tints } from "@/lib/mock-data";
import type { Organization } from "@/lib/types/student";

interface OrgCardProps {
  org: Organization;
  isFollowing: boolean;
  onToggleFollow: (orgId: string) => void;
}

export function OrgCard({ org, isFollowing, onToggleFollow }: OrgCardProps) {
  const moderator = getModeratorById(org.moderatorId);

  return (
    <article className="flex flex-col rounded-card bg-surface p-5 shadow-card">
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={org.avatar}
          alt=""
          className="h-14 w-14 rounded-full bg-accent-lavender object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[16px] font-bold">{org.name}</h3>
            {org.verified ? (
              <span className="inline-flex items-center gap-1 rounded-pill bg-accent-sky px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-icon-sky">
                <ShieldCheck size={12} />
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-muted">{org.distance}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] text-muted">{org.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {org.categories.map((cat) => {
          const tintKey =
            cat === "community"
              ? "lavender"
              : cat === "environment"
                ? "sky"
                : "pink";
          const tint = tints[tintKey];
          return (
            <span
              key={cat}
              className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
            >
              {cat}
            </span>
          );
        })}
      </div>

      <p className="mt-3 text-[12px] text-muted">
        {org.upcomingShifts} upcoming shift
        {org.upcomingShifts === 1 ? "" : "s"}
      </p>

      {moderator ? (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Assigned moderator
          </p>
          <ModeratorRow moderator={moderator} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onToggleFollow(org.id)}
        className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-pill py-2.5 text-[14px] font-semibold transition ${
          isFollowing
            ? "bg-primary text-white"
            : "bg-accent-lavender text-primary hover:bg-primary hover:text-white"
        }`}
      >
        {isFollowing ? (
          <Check size={15} strokeWidth={2.6} />
        ) : (
          <UserPlus size={15} strokeWidth={2.4} />
        )}
        {isFollowing ? "Following" : "Follow"}
      </button>
    </article>
  );
}
