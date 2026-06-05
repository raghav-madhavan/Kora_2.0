import { Topbar } from "@/components/student/topbar";
import { RightRail } from "@/components/student/right-rail";

interface PageShellProps {
  children: React.ReactNode;
  showRightRail?: boolean;
}

export function PageShell({ children, showRightRail = false }: PageShellProps) {
  return (
    <div className="flex min-w-0 flex-1">
      <main className="min-w-0 flex-1 px-8 pb-12 pt-7">
        <Topbar />
        {children}
      </main>
      {showRightRail ? <RightRail /> : null}
    </div>
  );
}
