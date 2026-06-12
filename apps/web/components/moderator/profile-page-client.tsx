"use client";

import { signOut } from "@/app/login/actions";
import { useEffect, useState } from "react";
import { BadgeCheck, Clock3, LogOut, ShieldCheck } from "lucide-react";
import { useOrgLogs } from "@/components/moderator/org-logs-provider";
import { StatCard } from "@/components/moderator/stat-card";
import { useToast } from "@/components/student/toast-provider";
import { currentModerator } from "@/lib/mock-data-moderator";

const PREFS_KEY = "kora-moderator-prefs-v1";

interface ModeratorPrefs {
  emailOnNewClaims: boolean;
}

function loadPrefs(): ModeratorPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ModeratorPrefs>;
      return { emailOnNewClaims: Boolean(parsed.emailOnNewClaims) };
    }
  } catch {
    // fall through to default
  }
  return { emailOnNewClaims: true };
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function ProfilePageClient() {
  const { logs, pendingCount, flaggedCount } = useOrgLogs();
  const toast = useToast();
  const [emailOnNewClaims, setEmailOnNewClaims] = useState(true);

  useEffect(() => {
    setEmailOnNewClaims(loadPrefs().emailOnNewClaims);
  }, []);

  const verifiedHours = logs
    .filter((log) => log.status === "verified")
    .reduce((sum, log) => sum + log.hours, 0);

  function toggleEmailPref() {
    const next = !emailOnNewClaims;
    setEmailOnNewClaims(next);
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ emailOnNewClaims: next } satisfies ModeratorPrefs),
    );
    toast.success(
      next
        ? "You'll be emailed about new claims"
        : "Claim emails turned off",
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Moderator identity */}
        <section className="rounded-card bg-surface p-6 shadow-card">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentModerator.avatar}
              alt={currentModerator.name}
              className="h-16 w-16 rounded-2xl bg-accent-sky object-cover"
            />
            <div className="min-w-0">
              <p className="text-[18px] font-bold">{currentModerator.name}</p>
              <p className="text-[14px] text-muted">
                {currentModerator.roleTitle}
              </p>
              <p className="mt-1 font-mono text-[12px] text-muted">
                {currentModerator.totalVerifications} verifications completed
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-black/5 pt-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/80">
              Notifications
            </p>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-4">
              <span className="text-[14px] font-medium">
                Email me when new claims arrive
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={emailOnNewClaims}
                aria-label="Email me when new claims arrive"
                onClick={toggleEmailPref}
                className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors duration-200 ${
                  emailOnNewClaims ? "bg-primary" : "bg-chart-track"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-card transition-all duration-200 ${
                    emailOnNewClaims ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </label>
            <p className="mt-2 text-[12px] text-muted">
              Delivery is mocked for now; emails arrive once accounts are
              wired up.
            </p>
          </div>

          <div className="mt-6 border-t border-black/5 pt-4">
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-pill px-4 py-2 text-[14px] font-semibold text-danger transition hover:bg-danger/10"
              >
                <LogOut size={16} strokeWidth={2.2} />
                Logout
              </button>
            </form>
          </div>
        </section>

        {/* Organization */}
        <section className="rounded-card bg-surface p-6 shadow-card">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentModerator.orgAvatar}
              alt={currentModerator.orgName}
              className="h-14 w-14 rounded-2xl bg-accent-sky object-cover"
            />
            <div className="min-w-0">
              <p className="text-[16px] font-bold">
                {currentModerator.orgName}
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-pill bg-accent-sky px-3 py-1 text-[12px] font-semibold text-icon-sky">
                <ShieldCheck size={13} strokeWidth={2.4} />
                Verified org
              </span>
            </div>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-muted">
            Students check in with your shift QR codes, and the hours you
            approve here count toward their school requirements.
          </p>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        <StatCard
          label="Verified hours"
          value={formatHours(verifiedHours)}
          icon={BadgeCheck}
          tint="sky"
          caption="Approved for City Parks shifts"
        />
        <StatCard
          label="Pending review"
          value={String(pendingCount)}
          icon={Clock3}
          tint="lavender"
          caption="Claims waiting on you"
        />
        <StatCard
          label="Flagged"
          value={String(flaggedCount)}
          icon={ShieldCheck}
          tint="pink"
          caption="Held by fraud checks"
        />
      </div>
    </div>
  );
}
