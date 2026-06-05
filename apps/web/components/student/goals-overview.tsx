import {
  getBrightFuturesTiers,
  getCategoryGoals,
  getGraduationRequirement,
  getVerifiedHours,
  getVerifiedHoursByCategory,
} from "@/lib/compliance";
import { hoursLog, student } from "@/lib/mock-data";
import { RequirementCard } from "@/components/student/requirement-card";
import { ProgressRing } from "@/components/student/progress-ring";

const categoryLabels = {
  community: "Community",
  environment: "Environment",
  education: "Education",
} as const;

export function GoalsOverview() {
  const state = student.schoolState;
  const graduationRequired = getGraduationRequirement(state);
  const brightFutures = getBrightFuturesTiers(state);
  const categoryGoals = getCategoryGoals(state);
  const verifiedHours = getVerifiedHours(hoursLog);
  const verifiedByCategory = getVerifiedHoursByCategory(hoursLog);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center rounded-card bg-surface p-8 shadow-card">
        <ProgressRing
          hoursLogged={verifiedHours}
          hoursRequired={graduationRequired}
        />
        <p className="mt-4 text-[14px] text-muted">
          Only verified hours count toward requirements
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <RequirementCard
          label="Graduation Requirement"
          logged={verifiedHours}
          required={graduationRequired}
        />
        {brightFutures ? (
          <>
            <RequirementCard
              label="Bright Futures Gold"
              logged={verifiedHours}
              required={brightFutures.gold}
            />
            <RequirementCard
              label="Bright Futures Silver"
              logged={verifiedHours}
              required={brightFutures.silver}
            />
          </>
        ) : null}
      </div>

      <div>
        <h2 className="mb-4 text-[20px] font-bold">Category Breakdown</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {(Object.keys(categoryGoals) as Array<keyof typeof categoryGoals>).map(
            (key) => (
              <RequirementCard
                key={key}
                label={categoryLabels[key]}
                logged={verifiedByCategory[key]}
                required={categoryGoals[key]}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
