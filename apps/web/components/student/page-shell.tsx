import dynamic from "next/dynamic";
import { Topbar } from "@/components/student/topbar";

const RightRail = dynamic(
  () =>
    import("@/components/student/right-rail").then((mod) => ({
      default: mod.RightRail,
    })),
  {
    loading: () => (
      <aside
        className="sticky top-0 hidden h-screen w-[372px] shrink-0 xl:block"
        aria-hidden
      />
    ),
  },
);

interface PageShellProps {
  children: React.ReactNode;
  showRightRail?: boolean;
}

export function PageShell({ children, showRightRail = false }: PageShellProps) {
  return (
    <div className="flex min-w-0 flex-1">
      <main
        id="main"
        className="stagger min-w-0 flex-1 px-4 pb-12 pt-7 sm:px-8"
      >
        <Topbar />
        {children}
      </main>
      {showRightRail ? <RightRail /> : null}
    </div>
  );
}
