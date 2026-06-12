import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CommandPaletteLazy } from "@/components/moderator/command-palette-lazy";
import { MobileNav } from "@/components/moderator/mobile-nav";
import { ModeratorShell } from "@/components/moderator/moderator-shell";
import { Sidebar } from "@/components/moderator/sidebar";
import { requireModerator } from "@/lib/auth/guards";
import { moderatorProfiles } from "@/lib/mock-data-moderator";
import {
  getModeratorShifts,
  getOrgLogs,
} from "@/lib/mock-store-server-moderator";

export const metadata: Metadata = {
  title: "Kora — Org Portal",
  description:
    "Verify student hours, manage shifts, and display check-in codes for your organization.",
};

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireModerator();
  const persona = moderatorProfiles[session.userId];
  if (!persona) {
    redirect("/login");
  }

  const initialLogs = getOrgLogs(session);
  const shifts = getModeratorShifts(session);

  const nextUpcomingShift = [...shifts]
    .filter((shift) => shift.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )[0];
  const qrHref = nextUpcomingShift
    ? `/moderator/shifts/${nextUpcomingShift.id}`
    : "/moderator/shifts";

  return (
    <ModeratorShell initialLogs={initialLogs} session={session} persona={persona}>
      <div className="min-h-screen bg-canvas pb-20 text-ink lg:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-panel focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-cream"
        >
          Skip to content
        </a>
        <div className="mx-auto flex max-w-shell">
          <Sidebar />
          {children}
        </div>
        <MobileNav qrHref={qrHref} />
        {session.access === "macro" ? <CommandPaletteLazy /> : null}
      </div>
    </ModeratorShell>
  );
}
