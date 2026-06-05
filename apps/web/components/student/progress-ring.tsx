import { getGraduationRequirement } from "@/lib/compliance";
import { student } from "@/lib/mock-data";

interface ProgressRingProps {
  hoursLogged?: number;
  hoursRequired?: number;
}

export function ProgressRing({
  hoursLogged = student.hoursLogged,
  hoursRequired = getGraduationRequirement(student.schoolState),
}: ProgressRingProps) {
  const pct = Math.round((hoursLogged / hoursRequired) * 100);
  const size = 150;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-chart-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={student.avatar}
        alt=""
        className="absolute h-[110px] w-[110px] rounded-full bg-accent-lavender object-cover"
      />

      <span className="absolute right-1 top-2 rounded-pill bg-primary px-2.5 py-1 text-[12px] font-bold text-white shadow-raised">
        {pct}%
      </span>
    </div>
  );
}
