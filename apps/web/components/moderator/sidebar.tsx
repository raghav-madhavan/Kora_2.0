"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { SidebarNav } from "@/components/moderator/sidebar-nav";
import { useToast } from "@/components/student/toast-provider";
import { currentModerator } from "@/lib/mock-data-moderator";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-6 shrink-0 px-3 font-mono text-[10px] font-semibold uppercase leading-snug tracking-[0.18em] text-muted/80">
      {children}
    </p>
  );
}

export function Sidebar() {
  const toast = useToast();

  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col bg-surface px-6 py-7 lg:flex">
      <div className="mb-2 flex items-center gap-2.5 px-1">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-panel shadow-raised">
          <span className="font-display text-[19px] font-bold italic leading-none text-cream">
            K
          </span>
          <span className="sr-only">Kora</span>
        </div>
        <span className="font-display text-[22px] font-semibold italic tracking-tight">
          Kora<span className="not-italic text-ember">.</span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <SectionLabel>Org Portal</SectionLabel>
        <SidebarNav />
      </div>

      <div className="mt-auto shrink-0 pt-2">
        <SectionLabel>Account</SectionLabel>
        <Link
          href="/moderator/profile"
          className="flex items-center gap-3 rounded-chip px-3 py-2 transition-colors duration-200 hover:bg-accent-lavender/70"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentModerator.avatar}
            alt={`${currentModerator.name}, ${currentModerator.roleTitle}`}
            className="h-9 w-9 shrink-0 rounded-xl bg-accent-sky object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold leading-tight">
              {currentModerator.name}
            </p>
            <p className="truncate font-mono text-[10px] text-muted">
              {currentModerator.orgName}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => toast.success("Sign-in coming soon")}
          className="flex w-full items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-semibold text-danger transition-colors duration-200 hover:bg-danger/10"
        >
          <LogOut size={20} strokeWidth={2.2} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
