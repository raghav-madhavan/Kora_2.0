import { getAllHoursLogs } from "@/lib/student-hours-server";
import { getAllNotifications } from "@/lib/mock-notifications-server";
import { Sidebar } from "@/components/student/sidebar";
import { MobileNav } from "@/components/student/mobile-nav";
import { StudentShell } from "@/components/student/student-shell";
import { CommandPaletteLazy } from "@/components/student/command-palette-lazy";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLogs = getAllHoursLogs();
  const initialNotifications = getAllNotifications();

  return (
    <StudentShell
      initialLogs={initialLogs}
      initialNotifications={initialNotifications}
    >
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
        <CommandPaletteLazy />
      </div>
    </StudentShell>
  );
}
