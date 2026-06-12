import { getSkillEmoji, getSkillLabel } from "@/lib/skills";
import type { MatchResult } from "@/lib/matching";

interface MatchExplainerProps {
  matchResult: MatchResult;
}

export function MatchExplainer({ matchResult }: MatchExplainerProps) {
  const { matchingSkills, reasons } = matchResult;

  if (matchingSkills.length === 0 && reasons.length === 0) return null;

  return (
    <div>
      {reasons.length > 0 ? (
        <ul className="mb-3 flex flex-col gap-1.5">
          {reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-[13px] text-ink/80"
            >
              <span className="mt-0.5 shrink-0 text-success">✓</span>
              {reason}
            </li>
          ))}
        </ul>
      ) : null}

      {matchingSkills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {matchingSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-3 py-1 text-[12px] font-semibold text-success"
            >
              <span>{getSkillEmoji(skill)}</span>
              {getSkillLabel(skill)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
