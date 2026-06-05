"use client";

import type { CategoryKey, LogStatus } from "@/lib/types/student";

export type StatusFilter = "all" | LogStatus;
export type CategoryFilter = "all" | CategoryKey;
export type SortOption = "newest" | "oldest" | "most-hours";

interface HoursFiltersProps {
  status: StatusFilter;
  category: CategoryFilter;
  sort: SortOption;
  onStatusChange: (status: StatusFilter) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onSortChange: (sort: SortOption) => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
];

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "community", label: "Community" },
  { value: "environment", label: "Environment" },
  { value: "education", label: "Education" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-hours", label: "Most hours" },
];

export function HoursFilters({
  status,
  category,
  sort,
  onStatusChange,
  onCategoryChange,
  onSortChange,
}: HoursFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition ${
              status === option.value
                ? "bg-primary text-white"
                : "bg-surface text-muted shadow-card hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
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
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="ml-auto rounded-pill border-0 bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
