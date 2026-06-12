"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, UserPlus } from "lucide-react";
import { ModeratorRow } from "@/components/student/moderator-row";
import { ShiftCard } from "@/components/student/shift-card";
import { useMockStore } from "@/lib/mock-store";
import { useProfileStore } from "@/lib/mock-profile-store";
import { useHours } from "@/components/student/hours-provider";
import { getModeratorById, tints } from "@/lib/mock-data";
import { getShiftsForOrg } from "@/lib/orgs";
import { rankShiftsForStudent } from "@/lib/matching";
import type { Organization } from "@/lib/types/student";

interface OrgDetailClientProps {
  org: Organization;
}

export function OrgDetailClient({ org: initialOrg }: OrgDetailClientProps) {
  const store = useMockStore();
  const { skills } = useProfileStore();
  const { categoryGaps } = useHours();

  const org = useMemo(() => {
    const live = store.getOrganizations().find((o) => o.id === initialOrg.id);
    return live ?? initialOrg;
  }, [store, initialOrg]);

  const isFollowing = store.isFollowing(org.id);
  const moderator = getModeratorById(org.moderatorId);

  const upcomingShifts = useMemo(() => {
    const allShifts = store.getShifts();
    const orgShifts = getShiftsForOrg(org.id, allShifts);
    return rankShiftsForStudent(skills, orgShifts, { categoryGaps });
  }, [store, org.id, skills, categoryGaps]);

  return (
    <div>
      <Link
        href="/organizations"
        className="mb-6 inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Organizations
      </Link>

      <div className="rounded-card bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={org.avatar}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full bg-accent-lavender object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-bold">{org.name}</h1>
              {org.verified ? (
                <span className="inline-flex items-center gap-1 rounded-pill bg-accent-sky px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-icon-sky">
                  <ShieldCheck size={13} />
                  Verified
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[14px] text-muted">{org.distance}</p>
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
          </div>
          <button
            type="button"
            onClick={() => store.toggleFollowOrg(org.id)}
            className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill px-5 py-2.5 text-[14px] font-semibold transition ${
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
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink/85">
          {org.description}
        </p>

        {moderator ? (
          <div className="mt-5 border-t border-black/5 pt-5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
              Assigned moderator
            </p>
            <ModeratorRow moderator={moderator} />
          </div>
        ) : null}

        <Link
          href={`/hours?q=${encodeURIComponent(org.name)}`}
          className="mt-5 inline-flex text-[14px] font-semibold text-primary hover:underline"
        >
          Your hours with this org →
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-[20px] font-bold">
          Upcoming shifts{" "}
          <span className="text-[15px] font-semibold text-muted">
            ({upcomingShifts.length})
          </span>
        </h2>
        {upcomingShifts.length === 0 ? (
          <p className="rounded-card bg-surface px-6 py-10 text-center text-[15px] text-muted shadow-card">
            No upcoming shifts from this organization right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcomingShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                isSaved={store.isSaved(shift.id)}
                isCommitted={store.isCommitted(shift.id)}
                matchResult={shift}
                onSave={store.toggleSavedShift}
                onCommit={store.commitToShift}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
