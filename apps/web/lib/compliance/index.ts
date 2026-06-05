import rules from "./rules.json";
import type { CategoryKey, ShiftLog } from "@/lib/types/student";

export type StateCode = keyof typeof rules;

function assertState(state: string): asserts state is StateCode {
  if (!(state in rules)) {
    throw new Error(`Unknown state code: ${state}`);
  }
}

export function getGraduationRequirement(state: string): number {
  assertState(state);
  return rules[state].graduation.default;
}

export function getBrightFuturesTiers(
  state: string,
): { gold: number; silver: number } | null {
  assertState(state);
  const stateRules = rules[state];
  if (!("brightFutures" in stateRules)) {
    return null;
  }
  return {
    gold: stateRules.brightFutures.gold,
    silver: stateRules.brightFutures.silver,
  };
}

export function getCategoryGoals(state: string): Record<CategoryKey, number> {
  assertState(state);
  return rules[state].categories;
}

export function getVerifiedHours(logs: ShiftLog[]): number {
  return logs
    .filter((log) => log.status === "verified")
    .reduce((sum, log) => sum + log.hours, 0);
}

export function getVerifiedHoursByCategory(
  logs: ShiftLog[],
): Record<CategoryKey, number> {
  const totals: Record<CategoryKey, number> = {
    community: 0,
    environment: 0,
    education: 0,
  };

  for (const log of logs) {
    if (log.status === "verified") {
      totals[log.categoryKey] += log.hours;
    }
  }

  return totals;
}
