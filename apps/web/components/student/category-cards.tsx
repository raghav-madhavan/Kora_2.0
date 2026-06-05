import { HeartHandshake, Leaf, GraduationCap, MoreVertical } from "lucide-react";
import { getCategoryGoals } from "@/lib/compliance";
import { categories, student, tints } from "@/lib/mock-data";
import type { CategoryKey } from "@/lib/types/student";

const icons: Record<CategoryKey, typeof HeartHandshake> = {
  community: HeartHandshake,
  environment: Leaf,
  education: GraduationCap,
};

export function CategoryCards() {
  const categoryGoals = getCategoryGoals(student.schoolState);

  return (
    <section className="mb-9 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {categories.map((c) => {
        const Icon = icons[c.key];
        const tint = tints[c.tint];
        const goal = categoryGoals[c.key];
        const pct = Math.round((c.logged / goal) * 100);
        return (
          <div
            key={c.key}
            className="flex items-center gap-3 rounded-card bg-surface p-5 shadow-card"
          >
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tint.bg}`}
            >
              <Icon size={22} strokeWidth={2.2} className={tint.fg} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-muted">
                {c.logged}/{goal} hrs · {pct}%
              </p>
              <p className="text-[16px] font-bold leading-tight">{c.label}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-canvas">
                <div
                  className="h-full rounded-pill bg-primary"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              className="-mr-1 self-start text-muted transition hover:text-ink"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        );
      })}
    </section>
  );
}
