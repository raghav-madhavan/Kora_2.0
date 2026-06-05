"use client";

import { useState } from "react";
import { MoreVertical, Plus, UserPlus, Check } from "lucide-react";
import { student, organizations } from "@/lib/mock-data";
import { ProgressRing } from "./progress-ring";
import { BarChart } from "./bar-chart";

export function RightRail() {
  const [follows, setFollows] = useState(
    () =>
      new Set(organizations.filter((o) => o.following).map((o) => o.id)),
  );

  const toggle = (id: number) =>
    setFollows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <aside className="sticky top-0 hidden h-screen w-[372px] shrink-0 overflow-y-auto px-6 py-7 xl:block">
      <div className="flex flex-col gap-6 rounded-card bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">My Progress</h2>
          <button
            type="button"
            className="text-muted transition hover:text-ink"
          >
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <ProgressRing />
          <h3 className="mt-4 text-[20px] font-extrabold">
            Good morning, {student.firstName} 🔥
          </h3>
          <p className="mt-1 text-[13px] text-muted">
            {student.streakWeeks}-week streak —{" "}
            {student.hoursRequired - student.hoursLogged} hours left to
            graduate.
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-bold">Hours this term</p>
            <span className="text-[12px] text-muted">per month</span>
          </div>
          <BarChart />
        </div>
      </div>

      <div className="mt-6 rounded-card bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold">Organizations</h2>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-full bg-accent-lavender text-primary transition hover:bg-primary hover:text-white"
          >
            <Plus size={16} strokeWidth={2.6} />
          </button>
        </div>

        <div className="flex flex-col">
          {organizations.map((o, i) => {
            const following = follows.has(o.id);
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
                  <p className="truncate text-[12px] text-muted">{o.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(o.id)}
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

        <button
          type="button"
          className="mt-4 w-full rounded-chip bg-accent-lavender py-3 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          See All
        </button>
      </div>
    </aside>
  );
}
