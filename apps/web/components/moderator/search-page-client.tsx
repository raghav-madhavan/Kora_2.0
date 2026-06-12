"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { VerificationRow } from "@/components/moderator/verification-row";
import {
  searchModeratorShifts,
  searchOrgClaims,
  searchOrgStudents,
} from "@/lib/moderator-search";
import { PageHeader } from "@/components/student/page-header";

function SectionEmpty({ message }: { message: string }) {
  return (
    <p className="rounded-card bg-surface px-6 py-8 text-center text-[14px] text-muted shadow-card">
      {message}
    </p>
  );
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const { logs } = useOrgLogs();

  const shiftResults = useMemo(() => searchModeratorShifts(query), [query]);
  const studentResults = useMemo(
    () => searchOrgStudents(query, logs),
    [query, logs],
  );
  const claimResults = useMemo(
    () => searchOrgClaims(query, logs),
    [query, logs],
  );

  const hasQuery = query.length > 0;
  const totalResults =
    shiftResults.length + studentResults.length + claimResults.length;

  return (
    <>
      <PageHeader
        title="Search results"
        description={
          hasQuery
            ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}"`
            : "Enter a search term to find shifts, students, and claims"
        }
      />

      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent-lavender">
            <Search size={28} className="text-primary" strokeWidth={2} />
          </div>
          <p className="max-w-sm text-[15px] text-muted">
            Press ⌘K anywhere in the org portal to search shifts, students, and
            hour claims.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 text-[18px] font-bold">
              Shifts{" "}
              <span className="text-[15px] font-semibold text-muted">
                ({shiftResults.length})
              </span>
            </h2>
            {shiftResults.length === 0 ? (
              <SectionEmpty message={`No shifts matching "${query}"`} />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {shiftResults.map((shift) => (
                  <Link
                    key={shift.id}
                    href={`/moderator/shifts/${shift.id}`}
                    className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card transition hover:shadow-raised"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shift.img}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold">
                        {shift.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                        <CalendarDays
                          size={13}
                          strokeWidth={2.2}
                          className="shrink-0"
                        />
                        {shift.date}
                      </p>
                      <p className="flex items-center gap-1.5 text-[12px] text-muted">
                        <MapPin
                          size={13}
                          strokeWidth={2.2}
                          className="shrink-0"
                        />
                        <span className="truncate">{shift.location}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-[18px] font-bold">
              Students{" "}
              <span className="text-[15px] font-semibold text-muted">
                ({studentResults.length})
              </span>
            </h2>
            {studentResults.length === 0 ? (
              <SectionEmpty message={`No students matching "${query}"`} />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {studentResults.map((student) => (
                  <Link
                    key={student.studentId}
                    href={`/moderator/verifications?status=${student.defaultTab}&q=${encodeURIComponent(student.studentName)}`}
                    className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card transition hover:shadow-raised"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.studentAvatar}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl bg-accent-lavender object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold">
                        {student.studentName}
                      </p>
                      <p className="truncate text-[12px] text-muted">
                        {student.school} · {student.claimCount} claim
                        {student.claimCount === 1 ? "" : "s"} ·{" "}
                        {formatHours(student.totalHours)} hrs
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-[18px] font-bold">
              Claims{" "}
              <span className="text-[15px] font-semibold text-muted">
                ({claimResults.length})
              </span>
            </h2>
            {claimResults.length === 0 ? (
              <SectionEmpty message={`No claims matching "${query}"`} />
            ) : (
              <div className="flex flex-col gap-4">
                {claimResults.map((log) => (
                  <VerificationRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
