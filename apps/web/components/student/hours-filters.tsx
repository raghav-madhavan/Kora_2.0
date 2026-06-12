"use client";

import type { CategoryKey, LogStatus } from "@/lib/types/student";
import { FilterChip } from "@/components/shared/filter-chip";

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
  { value: "rejected", label: "Rejected" },
];

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All categories" },
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
      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex flex-wrap gap-2"
      >
        {statusOptions.map((option) => (
          <FilterChip
            key={option.value}
            role="tab"
            aria-selected={status === option.value}
            active={status === option.value}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categoryOptions.map((option) => (
          <FilterChip
            key={option.value}
            active={category === option.value}
            onClick={() => onCategoryChange(option.value)}
          >
            {option.label}
          </FilterChip>
        ))}

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="ml-auto rounded-pill border-0 bg-surface px-4 py-2.5 text-[14px] font-semibold text-ink shadow-card outline-none ring-primary/40 focus:ring-2"
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
