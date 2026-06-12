import { formatScheduleDayLabel } from "@/lib/schedule";
import type { ScheduleStatus } from "@/lib/schedule";
import type { Shift, ShiftLog } from "@/lib/types/student";
import { ScheduleShiftRow } from "@/components/student/schedule-shift-row";

interface ScheduleDayGroupProps {
  dayKey: string;
  shifts: Shift[];
  getStatus: (shift: Shift) => ScheduleStatus;
  getVerifiedLog: (shiftId: string) => ShiftLog | undefined;
}

export function ScheduleDayGroup({
  dayKey,
  shifts,
  getStatus,
  getVerifiedLog,
}: ScheduleDayGroupProps) {
  const label = formatScheduleDayLabel(shifts[0]?.scheduledAt ?? dayKey);

  return (
    <section>
      <h2 className="mb-4 text-[18px] font-bold">{label}</h2>
      <div className="flex flex-col gap-4">
        {shifts.map((shift) => (
          <ScheduleShiftRow
            key={shift.id}
            shift={shift}
            status={getStatus(shift)}
            verifiedLog={getVerifiedLog(shift.id)}
          />
        ))}
      </div>
    </section>
  );
}
