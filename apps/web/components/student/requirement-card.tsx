interface RequirementCardProps {
  label: string;
  logged: number;
  required: number;
}

function getStatus(logged: number, required: number) {
  if (logged >= required) {
    return { label: "Complete", className: "bg-success/10 text-success" };
  }
  if (logged >= required * 0.6) {
    return { label: "On track", className: "bg-accent-sky text-icon-sky" };
  }
  return { label: "Behind", className: "bg-accent-pink text-flagged" };
}

export function RequirementCard({
  label,
  logged,
  required,
}: RequirementCardProps) {
  const pct = Math.round((logged / required) * 100);
  const status = getStatus(logged, required);

  return (
    <div className="rounded-card bg-surface p-6 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-[18px] font-bold">{label}</h3>
        <span
          className={`rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <p className="text-[14px] text-muted">
        <span className="text-[24px] font-extrabold text-ink">{logged}</span>
        <span className="text-muted"> / {required} hrs</span>
        <span className="ml-2 text-[13px]">({pct}%)</span>
      </p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-pill bg-canvas">
        <div
          className="h-full rounded-pill bg-primary"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
