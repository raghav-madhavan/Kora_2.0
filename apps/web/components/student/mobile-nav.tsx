"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  CircleGauge,
  CalendarSearch,
  ScanLine,
  Target,
  MoreHorizontal,
} from "lucide-react";
import { MobileMoreSheet } from "@/components/student/mobile-more-sheet";

const primaryItems = [
  { icon: CircleGauge, label: "Home", href: "/" },
  { icon: CalendarSearch, label: "Events", href: "/events" },
] as const;

const secondaryItems = [
  { icon: Target, label: "Goals", href: "/goals" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-surface/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-shell items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
          {primaryItems.map(({ icon: Icon, label, href }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold transition ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            );
          })}

          {/* Log Hours — center primary CTA */}
          <Link
            href="/log-hours"
            className={`-mt-4 flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              pathname.startsWith("/log-hours") ? "text-primary" : "text-white"
            }`}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-panel shadow-raised transition hover:bg-primary-deep">
              <ScanLine size={24} strokeWidth={2.2} className="text-cream" />
            </span>
            <span className={pathname.startsWith("/log-hours") ? "text-primary" : "text-muted"}>
              Log Hours
            </span>
          </Link>

          {secondaryItems.map(({ icon: Icon, label, href }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold transition ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex min-w-[56px] flex-col items-center gap-1 rounded-chip px-2 py-1.5 text-[10px] font-semibold text-muted transition hover:text-ink"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
            More
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
