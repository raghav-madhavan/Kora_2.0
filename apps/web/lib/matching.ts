// MVP tag-overlap matching. Phase 3 AI matching lives in services/matching-engine.

import type { CategoryKey } from "@/lib/types/student";

export interface MatchResult {
  matchScore: number;
  skillScore: number;
  goalsBoost: number;
  matchingSkills: string[];
  reasons: string[];
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  community: "Community Service",
  environment: "Environment",
  education: "Education",
};

export function getMatchLabel(score: number): string | null {
  if (score >= 0.7) return "Great fit";
  if (score >= 0.4) return "Good fit";
  if (score > 0) return "Some overlap";
  return null;
}

export function computeMatch(
  studentSkills: string[],
  shift: { skills: string[]; categoryKey: CategoryKey },
  categoryGaps?: Partial<Record<CategoryKey, number>>,
): MatchResult {
  const matchingSkills = studentSkills.filter((s) =>
    shift.skills.includes(s),
  );

  const skillScore =
    shift.skills.length === 0 ? 0 : matchingSkills.length / shift.skills.length;

  const reasons: string[] = [];

  if (matchingSkills.length > 0) {
    reasons.push(
      `Matches ${matchingSkills.length} of your skill${matchingSkills.length === 1 ? "" : "s"}`,
    );
  }

  const gap = categoryGaps?.[shift.categoryKey] ?? 0;
  const goalsBoost = gap > 0 ? 0.15 : 0;

  if (goalsBoost > 0) {
    const label = CATEGORY_LABELS[shift.categoryKey];
    reasons.push(`Helps your ${label} graduation goal`);
  }

  const matchScore = Math.min(1, skillScore + goalsBoost);

  return { matchScore, skillScore, goalsBoost, matchingSkills, reasons };
}

export function rankShiftsForStudent<
  T extends { skills: string[]; scheduledAt: string; categoryKey: CategoryKey },
>(
  studentSkills: string[],
  shifts: T[],
  options?: { categoryGaps?: Partial<Record<CategoryKey, number>> },
): Array<T & MatchResult> {
  return shifts
    .map((s) => {
      const result = computeMatch(studentSkills, s, options?.categoryGaps);
      return { ...s, ...result };
    })
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        a.scheduledAt.localeCompare(b.scheduledAt),
    );
}

// Legacy export kept for backward compat
export function matchScore(
  studentSkills: string[],
  shiftSkills: string[],
): number {
  if (shiftSkills.length === 0) return 0;
  const overlap = studentSkills.filter((s) => shiftSkills.includes(s)).length;
  return overlap / shiftSkills.length;
}
