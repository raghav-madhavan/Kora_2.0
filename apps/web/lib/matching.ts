// MVP tag-overlap matching. Phase 3 AI matching lives in services/matching-engine.

export function matchScore(
  studentSkills: string[],
  shiftSkills: string[],
): number {
  if (shiftSkills.length === 0) {
    return 0;
  }
  const overlap = studentSkills.filter((s) => shiftSkills.includes(s)).length;
  return overlap / shiftSkills.length;
}

export function rankShiftsForStudent<
  T extends { skills: string[]; scheduledAt: string },
>(studentSkills: string[], shifts: T[]): (T & { matchScore: number })[] {
  return shifts
    .map((s) => ({ ...s, matchScore: matchScore(studentSkills, s.skills) }))
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        a.scheduledAt.localeCompare(b.scheduledAt),
    );
}
