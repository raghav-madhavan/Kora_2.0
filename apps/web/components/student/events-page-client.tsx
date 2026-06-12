"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { rankShiftsForStudent } from "@/lib/matching";
import { useMockStore } from "@/lib/mock-store";
import { useProfileStore } from "@/lib/mock-profile-store";
import { useHours } from "@/components/student/hours-provider";
import { ShiftCard } from "@/components/student/shift-card";
import { ForYouEmpty } from "@/components/student/for-you-empty";
import {
  ShiftFilters,
  type CategoryFilter,
} from "@/components/student/shift-filters";
type EventsTab = "for-you" | "all" | "saved" | "committed";

const tabOptions: { value: EventsTab; label: string }[] = [
  { value: "for-you", label: "For You" },
  { value: "all", label: "All events" },
  { value: "saved", label: "Saved" },
  { value: "committed", label: "Committed" },
];

function parseTab(value: string | null): EventsTab {
  if (
    value === "for-you" ||
    value === "all" ||
    value === "saved" ||
    value === "committed"
  ) {
    return value;
  }
  return "for-you";
}

export function EventsPageClient() {
  const searchParams = useSearchParams();
  const store = useMockStore();
  const { skills } = useProfileStore();
  const { categoryGaps } = useHours();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [skill, setSkill] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<EventsTab>(() =>
    parseTab(searchParams.get("tab")),
  );

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearch(query);
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const allShifts = store.getShifts();

  const allSkills = useMemo(
    () => [...new Set(allShifts.flatMap((s) => s.skills))].sort(),
    [allShifts],
  );

  const filteredShifts = useMemo(() => {
    const ranked = rankShiftsForStudent(skills, allShifts, { categoryGaps });
    const query = search.trim().toLowerCase();

    return ranked.filter((shift) => {
      if (tab === "for-you" && shift.matchScore <= 0) return false;
      if (tab === "saved" && !store.isSaved(shift.id)) return false;
      if (tab === "committed" && !store.isCommitted(shift.id)) return false;
      if (category !== "all" && shift.categoryKey !== category) return false;
      if (skill && !shift.skills.includes(skill)) return false;
      if (
        query &&
        !shift.title.toLowerCase().includes(query) &&
        !shift.org.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [allShifts, category, skill, search, skills, store, tab, categoryGaps]);

  const showForYouEmpty = tab === "for-you" && filteredShifts.length === 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition ${
              tab === option.value
                ? "bg-primary text-white"
                : "bg-surface text-muted shadow-card hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ShiftFilters
        category={category}
        skill={skill}
        search={search}
        skills={allSkills}
        onCategoryChange={setCategory}
        onSkillChange={setSkill}
        onSearchChange={setSearch}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {showForYouEmpty ? (
          <ForYouEmpty />
        ) : (
          filteredShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              isSaved={store.isSaved(shift.id)}
              isCommitted={store.isCommitted(shift.id)}
              matchResult={shift}
              onSave={store.toggleSavedShift}
              onCommit={store.commitToShift}
            />
          ))
        )}
      </div>

      {!showForYouEmpty && filteredShifts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[15px] text-muted">
            {tab === "saved"
              ? "No saved shifts yet. Heart an event to save it for later."
              : tab === "committed"
                ? "No committed shifts yet. Browse events and commit to a shift."
                : "No shifts match your filters. Try adjusting your search."}
          </p>
          {tab !== "for-you" && tab !== "all" ? (
            <button
              type="button"
              onClick={() => setTab("all")}
              className="mt-4 text-[14px] font-semibold text-primary hover:underline"
            >
              View all events
            </button>
          ) : null}
          {tab === "committed" ? (
            <Link
              href="/schedule"
              className="mt-2 block text-[14px] font-semibold text-primary hover:underline"
            >
              Go to My Schedule
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
