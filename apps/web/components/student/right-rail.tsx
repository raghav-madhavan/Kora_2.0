"use client";

import Link from "next/link";
import { ArrowUpRight, Flame, Plus, UserPlus, Check } from "lucide-react";
import { student } from "@/lib/mock-data";
import { useMockStore } from "@/lib/mock-store";
import { useHours } from "@/components/student/hours-provider";
import { ProgressRing } from "./progress-ring";
import { BarChart } from "./bar-chart";

export function RightRail() {
  const { progress } = useHours();
  const store = useMockStore();
  const organizations = store.getOrganizations();

  return (
    <aside className="stagger sticky top-0 hidden h-screen w-[372px] shrink-0 overflow-y-auto px-6 py-7 xl:block">
      <div className="flex flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold tracking-tight">
            My Progress
          </h2>
          <Link
            href="/goals"
            className="text-muted transition hover:text-primary"
            aria-label="View goals"
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="flex flex-col items-center text-center">
          <ProgressRing hoursLogged={progress.verifiedHours} />
          <h3 className="mt-4 font-display text-[24px] font-semibold tracking-tight">
            Good morning, {student.firstName}
          </h3>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-ember/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ember">
            <Flame size={12} strokeWidth={2.4} />
            {student.streakWeeks}-week streak
          </span>
          <p className="mt-2.5 text-[13px] text-muted">
            <span className="font-mono font-semibold text-ink">
              {progress.hoursRemaining}
            </span>{" "}
            hours left to graduate.
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-bold">Hours this term</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              per month
            </span>
          </div>
          <BarChart />
        </div>
      </div>

      <div className="mt-6 rounded-card bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold tracking-tight">
            Organizations
          </h2>
          <Link
            href="/organizations"
            className="grid h-7 w-7 place-items-center rounded-full bg-accent-lavender text-primary transition hover:bg-primary hover:text-white"
          >
            <Plus size={16} strokeWidth={2.6} />
          </Link>
        </div>

        <div className="flex flex-col">
          {organizations.map((o, i) => {
            const following = store.isFollowing(o.id);
            return (
              <div
                key={o.id}
                className={`flex items-center gap-3 py-3 ${
                  i !== 0 ? "border-t border-dashed border-black/10" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={o.avatar}
                  alt=""
                  className="h-11 w-11 rounded-full bg-accent-lavender object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold">{o.name}</p>
                  <p className="truncate text-[12px] text-muted">{o.distance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => store.toggleFollowOrg(o.id)}
                  className={`flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[13px] font-semibold transition ${
                    following
                      ? "bg-primary text-white"
                      : "bg-accent-lavender text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {following ? (
                    <Check size={15} strokeWidth={2.6} />
                  ) : (
                    <UserPlus size={15} strokeWidth={2.4} />
                  )}
                  {following ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>

        <Link
          href="/organizations"
          className="mt-4 block w-full rounded-chip bg-accent-lavender py-3 text-center text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-[0.98]"
        >
          See All
        </Link>
      </div>
    </aside>
  );
}
