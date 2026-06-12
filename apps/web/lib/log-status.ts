import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { LogStatus } from "@/lib/types/student";

export interface LogStatusConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

export const logStatusConfig: Record<LogStatus, LogStatusConfig> = {
  verified: {
    label: "Verified",
    className: "text-success",
    icon: BadgeCheck,
  },
  pending: {
    label: "Pending",
    className: "text-pending",
    icon: Clock3,
  },
  flagged: {
    label: "Flagged",
    className: "text-flagged",
    icon: AlertTriangle,
  },
  rejected: {
    label: "Rejected",
    className: "text-muted",
    icon: XCircle,
  },
};
