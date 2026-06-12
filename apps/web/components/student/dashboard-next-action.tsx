"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Target, Sparkles, Search } from "lucide-react";
import { useMemo } from "react";
import { student } from "@/lib/mock-data";
import { useHours } from "@/components/student/hours-provider";
import { useMockStore } from "@/lib/mock-store";
import { useProfileStore } from "@/lib/mock-profile-store";
import { rankShiftsForStudent } from "@/lib/matching";
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface NextAction {
  kind: "checkin" | "hours" | "recommended" | "browse";
  headline: string;
  subline: string;
  href: string;
  icon: typeof CalendarCheck;
}

export function DashboardNextAction() {
  const { logs, progress, categoryGaps } = useHours();
  const store = useMockStore();
  const { skills } = useProfileStore();

  const action = useMemo<NextAction>(() => {
    const now = new Date();
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Priority 1: next committed shift within 7 days that has no verified log
    const committedShifts = store.getCommittedShifts();
    const verifiedShiftIds = new Set(
      logs.filter((l) => l.status === "verified").map((l) => l.shiftId),
    );

    const nextUnverified = committedShifts
      .filter((s) => {
        const d = new Date(s.scheduledAt);
        return d >= now && d <= sevenDaysOut && !verifiedShiftIds.has(s.id);
      })
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];

    if (nextUnverified) {
      return {
        kind: "checkin",
        headline: nextUnverified.title,
        subline: nextUnverified.date,
        href: "/log-hours",
        icon: CalendarCheck,
      };
    }

    // Priority 2: hours remaining toward graduation
    if (progress.hoursRemaining > 0) {
      return {
        kind: "hours",
        headline: `${progress.hoursRemaining} hours to graduation`,
        subline: "Track progress toward your requirement",
        href: "/goals",
        icon: Target,
      };
    }

    // Priority 3: top recommended shift
    const allShifts = store.getShifts();
    const ranked = rankShiftsForStudent(skills, allShifts, { categoryGaps });
    const topMatch = ranked.find((s) => s.matchScore > 0);

    if (topMatch) {
      return {
        kind: "recommended",
        headline: topMatch.title,
        subline: topMatch.date,
        href: `/events/${topMatch.id}`,
        icon: Sparkles,
      };
    }

    // Priority 4: fallback browse
    return {
      kind: "browse",
      headline: "Browse upcoming events",
      subline: "Find service opportunities near you",
      href: "/events?tab=for-you",
      icon: Search,
    };
  }, [logs, progress, categoryGaps, skills, store]);

  const greeting = `${getGreeting()}, ${student.firstName}`;

  const eyebrowByKind: Record<NextAction["kind"], string> = {
    checkin: "Check in after your shift",
    hours: "Keep going",
    recommended: "Recommended for you",
    browse: "Get started",
  };

  const Icon = action.icon;

  return (
    <div className="animate-rise mb-6 xl:hidden">
      <p className="mb-3 font-display text-[26px] font-semibold tracking-tight">
        {greeting}
        <span className="text-ember">.</span>
      </p>
      <Link
        href={action.href}
        className="group flex items-center gap-4 rounded-card bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-raised"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-panel text-cream transition group-hover:bg-primary-deep">
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {eyebrowByKind[action.kind]}
          </p>
          <p className="truncate text-[15px] font-bold text-ink">
            {action.headline}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {action.subline}
          </p>
        </div>
        <ArrowRight
          size={18}
          strokeWidth={2.2}
          className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </Link>
    </div>
  );
}
