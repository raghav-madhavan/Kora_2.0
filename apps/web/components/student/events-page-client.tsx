"use client";

import { useMemo, useState } from "react";
import { rankShiftsForStudent } from "@/lib/matching";
import { student } from "@/lib/mock-data";
import { useMockStore } from "@/lib/mock-store";
import { ShiftCard } from "@/components/student/shift-card";
import {
  ShiftFilters,
  type CategoryFilter,
} from "@/components/student/shift-filters";

function countSkillOverlap(studentSkills: string[], shiftSkills: string[]) {
  return studentSkills.filter((s) => shiftSkills.includes(s)).length;
}

export function EventsPageClient() {
  const store = useMockStore();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [skill, setSkill] = useState("");
  const [search, setSearch] = useState("");

  const allShifts = store.getShifts();

  const allSkills = useMemo(
    () => [...new Set(allShifts.flatMap((s) => s.skills))].sort(),
    [allShifts],
  );

  const filteredShifts = useMemo(() => {
    const ranked = rankShiftsForStudent(student.skills, allShifts);
    const query = search.trim().toLowerCase();

    return ranked.filter((shift) => {
      if (category !== "all" && shift.categoryKey !== category) {
        return false;
      }
      if (skill && !shift.skills.includes(skill)) {
        return false;
      }
      if (
        query &&
        !shift.title.toLowerCase().includes(query) &&
        !shift.org.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [allShifts, category, skill, search]);

  return (
    <>
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
        {filteredShifts.map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            isSaved={store.isSaved(shift.id)}
            isCommitted={store.isCommitted(shift.id)}
            matchScore={shift.matchScore}
            skillOverlap={countSkillOverlap(student.skills, shift.skills)}
            onSave={store.toggleSavedShift}
            onCommit={store.commitToShift}
          />
        ))}
      </div>

      {filteredShifts.length === 0 ? (
        <p className="py-12 text-center text-[15px] text-muted">
          No shifts match your filters. Try adjusting your search.
        </p>
      ) : null}
    </>
  );
}
