interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="animate-rise mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-balance font-display text-[34px] font-semibold leading-[1.1] tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-[15px] text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
