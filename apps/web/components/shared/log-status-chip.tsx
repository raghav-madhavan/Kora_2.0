import { logStatusConfig } from "@/lib/log-status";
import type { LogStatus } from "@/lib/types/student";

interface LogStatusChipProps {
  status: LogStatus;
  size?: "sm" | "md";
}

export function LogStatusChip({ status, size = "md" }: LogStatusChipProps) {
  const config = logStatusConfig[status];
  const Icon = config.icon;
  const iconSize = size === "sm" ? 15 : 16;
  const textClass = size === "sm" ? "text-[13px]" : "text-[13px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${textClass} ${config.className}`}
    >
      <Icon size={iconSize} strokeWidth={2.4} />
      {config.label}
    </span>
  );
}
