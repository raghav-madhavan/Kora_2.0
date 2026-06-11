export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div>
      {label ? (
        <p className="mb-1 text-xs text-[var(--color-muted)]">{label}</p>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        {value.toFixed(1)} / {max} hrs
      </p>
    </div>
  );
}
