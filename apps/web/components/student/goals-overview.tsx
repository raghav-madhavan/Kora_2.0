"use client";

import { useMemo, useState } from "react";
import {
  getBrightFuturesTiers,
  getCategoryGoals,
  getGraduationRequirement,
  getVerifiedHours,
  getVerifiedHoursByCategory,
} from "@/lib/compliance";
import { student } from "@/lib/mock-data";
import { RequirementCard } from "@/components/student/requirement-card";
import { GoalsCategoryChart } from "@/components/student/goals-category-chart";
import {
  GoalsMilestoneTimeline,
  buildMilestones,
} from "@/components/student/goals-milestone-timeline";
import { GoalsFaq } from "@/components/student/goals-faq";
import type { CategoryKey, ShiftLog } from "@/lib/types/student";

type BfTier = "silver" | "gold";

interface GoalsOverviewProps {
  logs: ShiftLog[];
}

export function GoalsOverview({ logs }: GoalsOverviewProps) {
  const state = student.schoolState;
  const graduationRequired = getGraduationRequirement(state);
  const brightFutures = getBrightFuturesTiers(state);
  const categoryGoals = getCategoryGoals(state);
  const verifiedHours = getVerifiedHours(logs);
  const verifiedByCategory = getVerifiedHoursByCategory(logs);
  const [highlightedCategory, setHighlightedCategory] =
    useState<CategoryKey | null>(null);
  const [bfTier, setBfTier] = useState<BfTier>("silver");

  const milestones = useMemo(
    () =>
      buildMilestones({
        verifiedHours,
        graduationRequired,
        brightFutures,
      }),
    [verifiedHours, graduationRequired, brightFutures],
  );

  return (
    <div className="flex flex-col gap-8">
      {brightFutures ? (
        <div className="flex flex-wrap gap-2">
          {(["silver", "gold"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setBfTier(tier)}
              className={`rounded-pill px-4 py-2 text-[13px] font-semibold capitalize transition ${
                bfTier === tier
                  ? "bg-primary text-white"
                  : "bg-surface text-muted shadow-card hover:text-ink"
              }`}
            >
              Bright Futures {tier}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <RequirementCard
          label="Graduation requirement"
          logged={verifiedHours}
          required={graduationRequired}
        />
        {brightFutures ? (
          <>
            <div
              className={
                bfTier === "silver" ? "ring-2 ring-primary rounded-card" : ""
              }
            >
              <RequirementCard
                label="Bright Futures Silver"
                logged={verifiedHours}
                required={brightFutures.silver}
              />
            </div>
            <div
              className={
                bfTier === "gold" ? "ring-2 ring-primary rounded-card" : ""
              }
            >
              <RequirementCard
                label="Bright Futures Gold"
                logged={verifiedHours}
                required={brightFutures.gold}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GoalsCategoryChart
          verifiedByCategory={verifiedByCategory}
          categoryGoals={categoryGoals}
          highlighted={highlightedCategory}
          onHighlight={setHighlightedCategory}
        />
        <GoalsMilestoneTimeline milestones={milestones} />
      </div>

      <GoalsFaq />
    </div>
  );
}
