"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleGauge,
  CalendarSearch,
  CalendarDays,
  Clock,
  Target,
  Building2,
  ScanLine,
  Mail,
  User,
  Search,
  CornerDownLeft,
} from "lucide-react";

export const OPEN_PALETTE_EVENT = "kora:palette";

/** Opens the command palette from anywhere (e.g. the topbar trigger). */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}

interface Destination {
  icon: typeof CircleGauge;
  label: string;
  href: string;
  /** Letter for the global `g`-then-letter chord. */
  key?: string;
  keywords?: string;
}

const destinations: Destination[] = [
  { icon: CircleGauge, label: "Dashboard", href: "/", key: "d", keywords: "home overview" },
  { icon: CalendarSearch, label: "Events", href: "/events", key: "e", keywords: "shifts opportunities browse" },
  { icon: CalendarDays, label: "Schedule", href: "/schedule", key: "s", keywords: "calendar upcoming" },
  { icon: ScanLine, label: "Log Hours", href: "/log-hours", key: "l", keywords: "scan qr check in" },
  { icon: Clock, label: "My Hours", href: "/hours", key: "h", keywords: "ledger logs verified" },
  { icon: Target, label: "Goals", href: "/goals", key: "g", keywords: "requirements graduation bright futures" },
  { icon: Building2, label: "Organizations", href: "/organizations", key: "o", keywords: "orgs nonprofits follow" },
  { icon: Mail, label: "Messages", href: "/messages", key: "m", keywords: "inbox threads chat" },
  { icon: User, label: "Profile", href: "/profile", keywords: "avatar account skills" },
];

const CHORD_TIMEOUT_MS = 1400;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const chordTimer = useRef<number | null>(null);
  const chordPending = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  // Global keyboard layer: ⌘K / Ctrl+K toggle, "/" opens, g-then-letter chords.
  useEffect(() => {
    const clearChord = () => {
      chordPending.current = false;
      if (chordTimer.current !== null) {
        window.clearTimeout(chordTimer.current);
        chordTimer.current = null;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
        clearChord();
        return;
      }

      if (open || isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        setOpen(true);
        clearChord();
        return;
      }

      if (chordPending.current) {
        const match = destinations.find((d) => d.key === event.key.toLowerCase());
        clearChord();
        if (match) {
          event.preventDefault();
          router.push(match.href);
        }
        return;
      }

      if (event.key.toLowerCase() === "g") {
        chordPending.current = true;
        chordTimer.current = window.setTimeout(clearChord, CHORD_TIMEOUT_MS);
      }
    };

    const onOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
      clearChord();
    };
  }, [open, router]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!trimmed) {
      return destinations;
    }
    const q = trimmed.toLowerCase();
    return destinations.filter(
      (d) =>
        d.label.toLowerCase().includes(q) || d.keywords?.toLowerCase().includes(q),
    );
  }, [trimmed]);

  // A free-text search row leads the list whenever there's a query.
  const rowCount = results.length + (trimmed ? 1 : 0);
  const searchRowIndex = trimmed ? 0 : -1;

  useEffect(() => {
    setSelected(0);
  }, [trimmed]);

  const activate = (index: number) => {
    if (index === searchRowIndex) {
      go(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    const dest = results[index - (trimmed ? 1 : 0)];
    if (dest) {
      go(dest.href);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/40 px-4 pt-[14vh] backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="w-full max-w-[560px] overflow-hidden rounded-card bg-surface shadow-raised">
        <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
          <Search size={18} strokeWidth={2.2} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                close();
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelected((s) => (s + 1) % Math.max(rowCount, 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelected((s) => (s - 1 + Math.max(rowCount, 1)) % Math.max(rowCount, 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                activate(selected);
              }
            }}
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
            placeholder="Jump to a page or search Kora…"
            aria-label="Command palette input"
          />
          <kbd className="shrink-0 rounded-md border border-black/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
            esc
          </kbd>
        </div>

        <ul className="max-h-[46vh] overflow-y-auto p-2">
          {trimmed ? (
            <li key="__search">
              <button
                type="button"
                onClick={() => activate(searchRowIndex)}
                onMouseEnter={() => setSelected(searchRowIndex)}
                className={`flex w-full items-center gap-3 rounded-chip px-3 py-2.5 text-left text-[14px] transition ${
                  selected === searchRowIndex
                    ? "bg-accent-lavender text-ink"
                    : "text-muted hover:bg-accent-lavender/50"
                }`}
              >
                <Search size={17} strokeWidth={2.2} className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">
                  Search for <span className="font-semibold text-ink">“{trimmed}”</span>
                </span>
                <CornerDownLeft size={14} className="shrink-0 text-muted/60" />
              </button>
            </li>
          ) : (
            <li className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">
              Go to
            </li>
          )}

          {results.map((dest, i) => {
            const index = i + (trimmed ? 1 : 0);
            const Icon = dest.icon;
            const active = selected === index;
            return (
              <li key={dest.href}>
                <button
                  type="button"
                  onClick={() => activate(index)}
                  onMouseEnter={() => setSelected(index)}
                  className={`flex w-full items-center gap-3 rounded-chip px-3 py-2.5 text-left text-[14px] font-medium transition ${
                    active ? "bg-accent-lavender text-ink" : "text-muted hover:bg-accent-lavender/50"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={2.2}
                    className={`shrink-0 ${active ? "text-primary" : "text-muted"}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{dest.label}</span>
                  {dest.key ? (
                    <kbd className="shrink-0 rounded-md border border-black/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted/80">
                      g&thinsp;{dest.key}
                    </kbd>
                  ) : null}
                </button>
              </li>
            );
          })}

        </ul>

        <div className="flex items-center gap-4 border-t border-black/5 bg-canvas/60 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/80">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">
            tip: press <span className="text-ink">g</span> then a letter anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
