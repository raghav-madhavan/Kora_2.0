import { student } from "@/lib/mock-data";

interface Milestone {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
}

interface GoalsMilestoneTimelineProps {
  milestones: Milestone[];
}

export function GoalsMilestoneTimeline({
  milestones,
}: GoalsMilestoneTimelineProps) {
  return (
    <div className="rounded-card bg-surface p-6 shadow-card">
      <h2 className="mb-1 text-[18px] font-bold">Milestones</h2>
      <p className="mb-6 text-[14px] text-muted">
        Your path toward graduation and scholarship goals
      </p>
      <ol className="space-y-0">
        {milestones.map((milestone, index) => (
          <li
            key={milestone.id}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {index < milestones.length - 1 ? (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${
                  milestone.complete ? "bg-primary/40" : "bg-black/10"
                }`}
              />
            ) : null}
            <span
              className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${
                milestone.complete
                  ? "border-primary bg-primary"
                  : "border-black/15 bg-canvas"
              }`}
            />
            <div>
              <p className="text-[14px] font-bold">{milestone.label}</p>
              <p className="mt-1 text-[13px] text-muted">{milestone.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-pill bg-accent-sky px-4 py-2 text-center text-[13px] font-semibold text-icon-sky">
        {student.streakWeeks}-week logging streak — keep it going!
      </p>
    </div>
  );
}

export function buildMilestones({
  verifiedHours,
  graduationRequired,
  brightFutures,
}: {
  verifiedHours: number;
  graduationRequired: number;
  brightFutures: { gold: number; silver: number } | null;
}): Milestone[] {
  const milestones: Milestone[] = [
    {
      id: "verified-20",
      label: "20 verified hours",
      detail:
        verifiedHours >= 20
          ? `${verifiedHours} hrs logged — great momentum`
          : `${20 - verifiedHours} hrs to go`,
      complete: verifiedHours >= 20,
    },
    {
      id: "graduation",
      label: "Graduation requirement",
      detail: `${verifiedHours} of ${graduationRequired} hrs (${Math.round((verifiedHours / graduationRequired) * 100)}%)`,
      complete: verifiedHours >= graduationRequired,
    },
  ];

  if (brightFutures) {
    milestones.push(
      {
        id: "bf-silver",
        label: "Bright Futures Silver",
        detail: `${verifiedHours} of ${brightFutures.silver} hrs`,
        complete: verifiedHours >= brightFutures.silver,
      },
      {
        id: "bf-gold",
        label: "Bright Futures Gold",
        detail: `${verifiedHours} of ${brightFutures.gold} hrs`,
        complete: verifiedHours >= brightFutures.gold,
      },
    );
  }

  return milestones;
}
