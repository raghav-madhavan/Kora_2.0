import { Topbar } from "@/components/moderator/topbar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1">
      <main
        id="main"
        className="stagger min-w-0 flex-1 px-4 pb-12 pt-7 sm:px-8"
      >
        <Topbar />
        {children}
      </main>
    </div>
  );
}
