import { monthlyHours } from "@/lib/mock-data";

export function BarChart() {
  const max = Math.max(...monthlyHours.map((m) => m.value));
  const peak = monthlyHours.reduce((a, b) => (b.value > a.value ? b : a));
  const ticks = [max, Math.round(max / 2), 0];

  return (
    <div className="rounded-card bg-canvas/70 p-4">
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-1 font-mono text-[10px] font-medium text-muted">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className="relative flex flex-1 items-end justify-between gap-2 border-l border-black/5 pl-3">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className="border-t border-dashed border-black/5" />
            ))}
          </div>

          {monthlyHours.map((m, i) => {
            const isPeak = m.label === peak.label;
            return (
              <div
                key={m.label}
                className="flex w-full flex-col items-center gap-2"
              >
                <div
                  className={`animate-grow w-full max-w-[26px] origin-bottom rounded-t-lg transition-colors ${
                    isPeak ? "bg-primary" : "bg-chart-track hover:bg-primary/30"
                  }`}
                  style={{
                    height: `${(m.value / max) * 120}px`,
                    animationDelay: `${i * 70}ms`,
                  }}
                  title={`${m.value} hrs`}
                />
                <span
                  className={`font-mono text-[10px] font-medium uppercase ${
                    isPeak ? "text-primary" : "text-muted"
                  }`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
