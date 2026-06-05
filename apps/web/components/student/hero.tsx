import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { student } from "@/lib/mock-data";

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute fill-white ${className}`}
      aria-hidden
    >
      <path d="M50 0 C53 33 67 47 100 50 C67 53 53 67 50 100 C47 67 33 53 0 50 C33 47 47 33 50 0 Z" />
    </svg>
  );
}

export function Hero() {
  const remaining = student.hoursRequired - student.hoursLogged;

  return (
    <section className="relative mb-6 overflow-hidden rounded-card bg-gradient-to-br from-banner-from to-banner-to px-10 py-9 text-white shadow-raised">
      <Sparkle className="right-[18%] top-8 h-16 w-16 opacity-90" />
      <Sparkle className="right-[6%] top-24 h-28 w-28 opacity-80" />
      <Sparkle className="right-[30%] bottom-2 h-10 w-10 opacity-70" />

      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/75">
        FL Bright Futures · Graduation Service Requirement
      </p>
      <h1 className="max-w-xl text-[40px] font-extrabold leading-[1.08]">
        You&apos;re {student.hoursLogged} of {student.hoursRequired} hours
        toward graduation
      </h1>
      <p className="mt-3 max-w-md text-[15px] text-white/80">
        Just {remaining} more hours to go — log a shift or find a local event
        this week. Gold: {student.brightFuturesGold} hrs · Silver:{" "}
        {student.brightFuturesSilver} hrs.
      </p>

      <div className="mt-7 flex items-center gap-3">
        <Link
          href="/scan"
          className="group flex items-center gap-3 rounded-pill bg-ink-button py-3 pl-6 pr-3 text-[15px] font-semibold transition hover:bg-black"
        >
          Log Hours
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink transition group-hover:translate-x-0.5">
            <Plus size={17} strokeWidth={2.5} />
          </span>
        </Link>
        <Link
          href="/events"
          className="flex items-center gap-2 rounded-pill bg-white/15 px-6 py-3 text-[15px] font-semibold backdrop-blur transition hover:bg-white/25"
        >
          Find Events
          <ArrowRight size={17} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}
