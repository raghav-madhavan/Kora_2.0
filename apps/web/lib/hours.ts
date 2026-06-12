import { getModeratorById } from "@/lib/mock-data";
import { getShiftById } from "@/lib/shifts";
import type { LogStatus, OrgModerator, ShiftLog } from "@/lib/types/student";

export interface LogTimelineStep {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
}

export function getModeratorForLog(log: ShiftLog): OrgModerator | undefined {
  if (log.verifiedByModeratorId) {
    return getModeratorById(log.verifiedByModeratorId);
  }

  const shift = getShiftById(log.shiftId);
  if (shift) {
    return getModeratorById(shift.moderatorId);
  }

  return undefined;
}

export function formatLogDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getLogTimelineSteps(log: ShiftLog): LogTimelineStep[] {
  const completed = formatLogDateTime(log.completedAt);
  const verified = formatLogDateTime(log.verifiedAt);

  const steps: LogTimelineStep[] = [
    {
      id: "logged",
      label: "Hours logged",
      detail: completed,
      complete: true,
    },
    {
      id: "submitted",
      label: "Submitted for verification",
      detail: completed,
      complete: log.status !== "flagged" || Boolean(log.qrToken),
    },
  ];

  if (log.status === "verified") {
    steps.push({
      id: "verified",
      label: "Verified by moderator",
      detail: verified,
      complete: true,
    });
  } else if (log.status === "pending") {
    steps.push({
      id: "verified",
      label: "Awaiting moderator approval",
      detail: "Usually within 24 hours",
      complete: false,
    });
  } else if (log.status === "rejected") {
    steps.push({
      id: "rejected",
      label: "Rejected by moderator",
      detail: log.rejectReason ?? "Contact your org moderator for details.",
      complete: true,
    });
  } else {
    steps.push({
      id: "flagged",
      label: "Flagged for review",
      detail: log.flagReason ?? "Contact your school counselor",
      complete: false,
    });
  }

  return steps;
}

export function getLogHeroGradient(status: LogStatus): string {
  if (status === "verified") {
    return "linear-gradient(135deg, #DDF0FB 0%, rgba(0, 196, 204, 0.35) 100%)";
  }
  if (status === "pending") {
    return "linear-gradient(135deg, #FFF8E7 0%, #FFE082 100%)";
  }
  if (status === "rejected") {
    return "linear-gradient(135deg, #F5F5F5 0%, rgba(0, 0, 0, 0.08) 100%)";
  }
  return "linear-gradient(135deg, #FBE4F1 0%, rgba(244, 102, 63, 0.25) 100%)";
}
