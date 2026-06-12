"use client";

import { useEffect, useId, useState } from "react";
import { getGraduationRequirement } from "@/lib/compliance";
import { student } from "@/lib/mock-data";
import { useStudentAvatar } from "@/lib/use-student-avatar";
import { useCountUp } from "@/lib/use-count-up";
import { StudentAvatar } from "@/components/student/student-avatar";

interface ProgressRingProps {
  hoursLogged?: number;
  hoursRequired?: number;
  size?: "default" | "compact";
  /** "dark" renders the ring for ink-panel surfaces. */
  tone?: "light" | "dark";
}

export function ProgressRing({
  hoursLogged = student.hoursLogged,
  hoursRequired = getGraduationRequirement(student.schoolState),
  size = "default",
  tone = "light",
}: ProgressRingProps) {
  const avatar = useStudentAvatar();
  const gradientId = useId();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = Math.round((hoursLogged / hoursRequired) * 100);
  const shownPct = Math.round(useCountUp(pct, 1100));
  const ringSize = size === "compact" ? 108 : 150;
  const avatarSize = size === "compact" ? 78 : 110;
  const stroke = size === "compact" ? 6 : 8;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * c;

  return (
    <div className="relative grid shrink-0 place-items-center">
      <svg width={ringSize} height={ringSize} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tone === "dark" ? "#2bd4c4" : "#0b8f88"} />
            <stop offset="100%" stopColor={tone === "dark" ? "#0b8f88" : "#086b66"} />
          </linearGradient>
        </defs>
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={r}
          fill="none"
          stroke={
            tone === "dark" ? "rgba(243, 239, 226, 0.14)" : "var(--color-chart-track)"
          }
          strokeWidth={stroke}
        />
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={drawn ? c - dash : c}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      <StudentAvatar
        config={avatar}
        size={avatarSize}
        className="absolute rounded-full bg-accent-lavender"
      />

      <span
        className={`absolute rounded-pill font-mono font-bold shadow-raised ${
          tone === "dark" ? "bg-cream text-ink" : "bg-panel text-cream"
        } ${
          size === "compact"
            ? "right-0 top-1 px-2 py-0.5 text-[10px]"
            : "right-1 top-2 px-2.5 py-1 text-[12px]"
        }`}
      >
        {shownPct}%
      </span>
    </div>
  );
}
