import Link from "next/link";
import { Settings, LogOut, Sparkles } from "lucide-react";
import { SidebarNav } from "@/components/student/sidebar-nav";
import { friends } from "@/lib/mock-data";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-7 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
      {children}
    </p>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col bg-surface px-6 py-7 lg:flex">
      <div className="mb-2 flex items-center gap-2.5 px-1">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-raised">
          <Sparkles size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[20px] font-extrabold tracking-tight">Kora</span>
      </div>

      <SectionLabel>Overview</SectionLabel>
      <SidebarNav />

      <SectionLabel>Friends</SectionLabel>
      <div className="flex flex-col gap-3 px-1">
        {friends.map((f) => (
          <div key={f.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.avatar}
              alt=""
              className="h-9 w-9 rounded-full bg-accent-lavender object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{f.name}</p>
              <p className="truncate text-[12px] text-muted">{f.role}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <SectionLabel>Settings</SectionLabel>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-medium text-muted transition hover:bg-accent-lavender/50 hover:text-ink"
        >
          <Settings size={20} strokeWidth={2.2} />
          Settings
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-semibold text-danger transition hover:bg-danger/10"
        >
          <LogOut size={20} strokeWidth={2.2} />
          Logout
        </Link>
      </div>
    </aside>
  );
}
