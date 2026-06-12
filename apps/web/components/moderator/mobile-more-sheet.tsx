"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  Search,
  User,
  X,
} from "lucide-react";
import { useModeratorSession } from "@/components/moderator/session-provider";
import { filterModeratorNav } from "@/lib/auth/policy";

const moreItems = [
  { icon: CalendarDays, label: "Shifts", href: "/moderator/shifts" },
  { icon: ClipboardCheck, label: "Verifications", href: "/moderator/verifications" },
  { icon: Search, label: "Search", href: "/moderator/search" },
  { icon: User, label: "Profile", href: "/moderator/profile" },
];

interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMoreSheet({ open, onClose }: MobileMoreSheetProps) {
  const { session } = useModeratorSession();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-5 shadow-raised">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[18px] font-bold">More</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {filterModeratorNav(session, moreItems).map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-4 rounded-chip px-3 py-3.5 text-[15px] font-semibold text-ink transition hover:bg-accent-lavender/60"
            >
              <Icon size={20} strokeWidth={2.2} className="shrink-0 text-primary" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
