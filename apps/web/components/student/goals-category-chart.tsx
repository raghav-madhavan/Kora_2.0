"use client";

import { useRouter } from "next/navigation";
import type { CategoryKey } from "@/lib/types/student";

const categoryLabels: Record<CategoryKey, string> = {
  community: "Community",
  environment: "Environment",
  education: "Education",
};

const categoryColors: Record<CategoryKey, string> = {
  community: "bg-primary",
  environment: "bg-icon-sky",
  education: "bg-icon-pink",
};

interface GoalsCategoryChartProps {
  verifiedByCategory: Record<CategoryKey, number>;
  categoryGoals: Record<CategoryKey, number>;
  highlighted?: CategoryKey | null;
  onHighlight?: (key: CategoryKey | null) => void;
}

export function GoalsCategoryChart({
  verifiedByCategory,
  categoryGoals,
  highlighted = null,
  onHighlight,
}: GoalsCategoryChartProps) {
  const router = useRouter();
  const maxGoal = Math.max(...Object.values(categoryGoals));

  return (
    <div className="rounded-card bg-surface p-6 shadow-card">
      <h2 className="mb-1 text-[18px] font-bold">Category breakdown</h2>
      <p className="mb-6 text-[14px] text-muted">
        Verified hours by service type — tap a category to highlight
      </p>
      <div className="flex flex-col gap-5">
        {(Object.keys(categoryGoals) as CategoryKey[]).map((key) => {
          const logged = verifiedByCategory[key];
          const goal = categoryGoals[key];
          const pct = Math.min(Math.round((logged / goal) * 100), 100);
          const active = highlighted === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onHighlight?.(active ? null : key);
                router.push(`/hours?category=${key}`);
              }}
              className={`rounded-xl p-3 text-left transition ${
                active ? "bg-accent-lavender ring-2 ring-primary" : "hover:bg-canvas"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold">
                  {categoryLabels[key]}
                </span>
                <span className="text-[13px] font-semibold text-muted">
                  {logged}/{goal} hrs ({pct}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-pill bg-canvas">
                <div
                  className={`h-full rounded-pill transition-all duration-500 ${categoryColors[key]}`}
                  style={{
                    width: `${(logged / maxGoal) * 100}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
