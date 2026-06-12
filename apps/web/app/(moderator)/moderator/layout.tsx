import type { Metadata } from "next";
import { CommandPalette } from "@/components/moderator/command-palette";
import { MobileNav } from "@/components/moderator/mobile-nav";
import { ModeratorShell } from "@/components/moderator/moderator-shell";
import { Sidebar } from "@/components/moderator/sidebar";
import { getOrgLogs } from "@/lib/mock-store-server-moderator";

export const metadata: Metadata = {
  title: "Kora — Org Portal",
  description:
    "Verify student hours, manage shifts, and display check-in codes for your organization.",
};

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLogs = getOrgLogs();

  return (
    <ModeratorShell initialLogs={initialLogs}>
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
        <MobileNav />
        <CommandPalette />
      </div>
    </ModeratorShell>
  );
}
