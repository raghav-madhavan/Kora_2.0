"use client";

import { Search } from "lucide-react";
import type { CategoryKey } from "@/lib/types/student";

export type CategoryFilter = "all" | CategoryKey;

interface ShiftFiltersProps {
  category: CategoryFilter;
  skill: string;
  search: string;
  skills: string[];
  onCategoryChange: (category: CategoryFilter) => void;
  onSkillChange: (skill: string) => void;
  onSearchChange: (search: string) => void;
}

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "community", label: "Community" },
  { value: "environment", label: "Environment" },
  { value: "education", label: "Education" },
];

export function ShiftFilters({
  category,
  skill,
  search,
  skills,
  onCategoryChange,
  onSkillChange,
  onSearchChange,
}: ShiftFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex h-12 items-center gap-3 rounded-pill bg-surface px-5 shadow-card">
        <Search size={19} className="text-muted" strokeWidth={2.2} />
        <input
          className="w-full bg-transparent text-[15px] placeholder:text-muted focus:outline-none"
          placeholder="Search shifts by title or organization…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onCategoryChange(option.value)}
            className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition ${
              category === option.value
                ? "bg-primary text-white"
                : "bg-surface text-muted shadow-card hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}

        <select
          value={skill}
          onChange={(e) => onSkillChange(e.target.value)}
          className="ml-auto rounded-pill border-0 bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All skills</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
