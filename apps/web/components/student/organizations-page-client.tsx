"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { OrgCard } from "@/components/student/org-card";
import type { CategoryKey } from "@/lib/types/student";

type CategoryFilter = "all" | CategoryKey;

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "community", label: "Community" },
  { value: "environment", label: "Environment" },
  { value: "education", label: "Education" },
];

export function OrganizationsPageClient() {
  const searchParams = useSearchParams();
  const store = useMockStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearch(query);
    }
  }, [searchParams]);

  const organizations = store.getOrganizations().filter((org) => org.verified);

  const filteredOrgs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return organizations.filter((org) => {
      if (category !== "all" && !org.categories.includes(category)) {
        return false;
      }
      if (
        query &&
        !org.name.toLowerCase().includes(query) &&
        !org.description.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [organizations, search, category]);

  return (
    <>
      <div className="mb-6 flex h-12 items-center gap-3 rounded-pill bg-surface px-5 shadow-card">
        <Search size={19} className="text-muted" strokeWidth={2.2} />
        <input
          className="w-full bg-transparent text-[15px] placeholder:text-muted focus:outline-none"
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCategory(option.value)}
            className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition ${
              category === option.value
                ? "bg-primary text-white"
                : "bg-surface text-muted shadow-card hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrgs.map((org) => (
          <OrgCard
            key={org.id}
            org={org}
            isFollowing={store.isFollowing(org.id)}
            onToggleFollow={store.toggleFollowOrg}
          />
        ))}
      </div>

      {filteredOrgs.length === 0 ? (
        <p className="py-12 text-center text-[15px] text-muted">
          No organizations match your filters.
        </p>
      ) : null}
    </>
  );
}
