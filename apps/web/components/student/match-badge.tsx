import { getMatchLabel } from "@/lib/matching";

interface MatchBadgeProps {
  matchScore: number;
  matchingSkillsCount?: number;
  className?: string;
}

export function MatchBadge({ matchScore, matchingSkillsCount, className = "" }: MatchBadgeProps) {
  const label = getMatchLabel(matchScore);
  if (!label) return null;

  const isGreat = matchScore >= 0.7;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-pill px-3 py-1 text-[11px] font-semibold ${
        isGreat
          ? "bg-success/15 text-success"
          : "bg-accent-lavender text-primary"
      } ${className}`}
    >
      {isGreat ? "✦" : "◈"} {label}
      {matchingSkillsCount !== undefined && matchingSkillsCount > 0
        ? ` · ${matchingSkillsCount} skill${matchingSkillsCount === 1 ? "" : "s"}`
        : null}
    </span>
  );
}
