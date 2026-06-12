import { student } from "@/lib/mock-data";
import {
  getCategoryGoals,
  getGraduationRequirement,
  getVerifiedHours,
  getVerifiedHoursByCategory,
} from "@/lib/compliance";
import type { CategoryKey, ShiftLog } from "@/lib/types/student";

export interface ProgressSnapshot {
  graduationRequired: number;
  verifiedHours: number;
  hoursRemaining: number;
  verifiedByCategory: Record<CategoryKey, number>;
  categoryGoals: Record<CategoryKey, number>;
  pct: number;
}

export function getProgressSnapshot(logs: ShiftLog[]): ProgressSnapshot {
  const state = student.schoolState;
  const graduationRequired = getGraduationRequirement(state);
  const verifiedHours = getVerifiedHours(logs);
  const hoursRemaining = Math.max(0, graduationRequired - verifiedHours);
  const verifiedByCategory = getVerifiedHoursByCategory(logs);
  const categoryGoals = getCategoryGoals(state);
  const pct = Math.round((verifiedHours / graduationRequired) * 100);

  return {
    graduationRequired,
    verifiedHours,
    hoursRemaining,
    verifiedByCategory,
    categoryGoals,
    pct,
  };
}

export function getCategoryGaps(
  progress: ProgressSnapshot,
): Partial<Record<CategoryKey, number>> {
  const gaps: Partial<Record<CategoryKey, number>> = {};
  for (const key of Object.keys(progress.categoryGoals) as CategoryKey[]) {
    const gap = progress.categoryGoals[key] - progress.verifiedByCategory[key];
    if (gap > 0) {
      gaps[key] = gap;
    }
  }
  return gaps;
}
