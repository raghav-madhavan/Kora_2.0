"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/student/page-header";
import { ShiftCard } from "@/components/student/shift-card";
import { OrgCard } from "@/components/student/org-card";
import { useMockStore } from "@/lib/mock-store";
import { useHours } from "@/components/student/hours-provider";
import { rankShiftsForStudent } from "@/lib/matching";
import { useProfileStore } from "@/lib/mock-profile-store";
import { tints } from "@/lib/mock-data";

function SectionEmpty({ message }: { message: string }) {
  return (
    <p className="rounded-card bg-surface px-6 py-8 text-center text-[14px] text-muted shadow-card">
      {message}
    </p>
  );
}

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const normalizedQuery = query.toLowerCase();

  const store = useMockStore();
  const { logs, categoryGaps } = useHours();
  const { skills } = useProfileStore();

  const eventResults = useMemo(() => {
    if (!normalizedQuery) return [];
    const allShifts = store.getShifts();
    const ranked = rankShiftsForStudent(skills, allShifts, { categoryGaps });
    return ranked.filter(
      (shift) =>
        shift.title.toLowerCase().includes(normalizedQuery) ||
        shift.org.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, store, skills, categoryGaps]);

  const orgResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return store.getOrganizations().filter(
      (org) =>
        org.name.toLowerCase().includes(normalizedQuery) ||
        org.description.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, store]);

  const hourResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return logs.filter(
      (log) =>
        log.activity.toLowerCase().includes(normalizedQuery) ||
        log.org.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, logs]);

  const hasQuery = query.length > 0;
  const totalResults =
    eventResults.length + orgResults.length + hourResults.length;

  return (
    <>
      <PageHeader
        title="Search results"
        description={
          hasQuery
            ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}"`
            : "Enter a search term to find events, organizations, and hours"
        }
      />

      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent-lavender">
            <Search size={28} className="text-primary" strokeWidth={2} />
          </div>
          <p className="max-w-sm text-[15px] text-muted">
            Use the search bar above to find events, organizations, and logged
            hours.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 text-[18px] font-bold">
              Events{" "}
              <span className="text-[15px] font-semibold text-muted">
                ({eventResults.length})
              </span>
            </h2>
            {eventResults.length === 0 ? (
              <SectionEmpty message={`No events matching "${query}"`} />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {eventResults.map((shift) => (
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

          <section>
            <h2 className="mb-4 text-[18px] font-bold">
              Organizations{" "}
              <span className="text-[15px] font-semibold text-muted">
                ({orgResults.length})
              </span>
            </h2>
            {orgResults.length === 0 ? (
              <SectionEmpty message={`No organizations matching "${query}"`} />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {orgResults.map((org) => (
                  <OrgCard
                    key={org.id}
                    org={org}
                    isFollowing={store.isFollowing(org.id)}
                    onToggleFollow={store.toggleFollowOrg}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-[18px] font-bold">
              Hours{" "}
              <span className="text-[15px] font-semibold text-muted">
                ({hourResults.length})
              </span>
            </h2>
            {hourResults.length === 0 ? (
              <SectionEmpty message={`No hours matching "${query}"`} />
            ) : (
              <div className="flex flex-col gap-4">
                {hourResults.map((row) => {
                  const tint = tints[row.categoryTint];
                  return (
                    <Link
                      key={row.id}
                      href={`/hours/${row.id}`}
                      className="rounded-card bg-surface p-4 shadow-card transition hover:shadow-raised"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.avatar}
                          alt=""
                          className="h-10 w-10 rounded-xl bg-accent-lavender object-cover"
                        />
                        <div>
                          <p className="text-[14px] font-semibold">{row.org}</p>
                          <p className="text-[12px] text-muted">{row.date}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[14px] text-ink/80">
                        {row.activity}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
                        >
                          {row.category}
                        </span>
                        <span className="text-[14px] font-bold">
                          {row.hours} hrs
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
