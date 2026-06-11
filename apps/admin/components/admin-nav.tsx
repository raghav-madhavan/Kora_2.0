"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/compliance", label: "Compliance" },
  { href: "/fraud", label: "Fraud review" },
  { href: "/export", label: "Export" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-ink)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
