import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  iconClassName?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  iconClassName = "text-muted",
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-card bg-surface px-6 py-14 text-center shadow-card">
      <Icon size={28} strokeWidth={2.2} className={`mx-auto ${iconClassName}`} />
      <p className="mt-3 text-balance text-[16px] font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-pretty text-[14px] leading-relaxed text-muted">
        {body}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
