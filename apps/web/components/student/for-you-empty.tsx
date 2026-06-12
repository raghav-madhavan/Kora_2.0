import Link from "next/link";
import { Sparkles } from "lucide-react";

export function ForYouEmpty() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent-lavender">
        <Sparkles size={28} className="text-primary" strokeWidth={2} />
      </div>
      <h3 className="text-[18px] font-bold">No matches yet</h3>
      <p className="mt-2 max-w-xs text-[14px] text-muted">
        Add skills to your profile so we can recommend shifts that fit you.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href="/profile"
          className="rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
        >
          Add skills
        </Link>
        <Link
          href="/events?tab=all"
          className="rounded-pill bg-accent-lavender px-5 py-2.5 text-[14px] font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Browse all events
        </Link>
      </div>
    </div>
  );
}
