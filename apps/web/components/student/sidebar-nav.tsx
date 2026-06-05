"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarSearch,
  Clock,
  Target,
  Building2,
} from "lucide-react";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: CalendarSearch, label: "Events", href: "/events" },
  { icon: Clock, label: "My Hours", href: "/hours" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Building2, label: "Organizations", href: "/organizations" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ icon: Icon, label, href }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            className={`group flex items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-medium transition ${
              active
                ? "bg-accent-lavender text-ink"
                : "text-muted hover:bg-accent-lavender/50 hover:text-ink"
            }`}
          >
            <Icon
              size={20}
              strokeWidth={2.2}
              className={
                active ? "text-primary" : "text-muted group-hover:text-primary"
              }
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
