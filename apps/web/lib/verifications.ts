import type { OrgLogStatus, OrgShiftLog } from "@/lib/types/moderator";

export interface OrgLogTimelineStep {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
}

export type VerificationTab = "pending" | "flagged" | "history";

const TAB_VALUES: VerificationTab[] = ["pending", "flagged", "history"];

export function toVerificationTab(raw: string | null): VerificationTab {
  return TAB_VALUES.includes(raw as VerificationTab)
    ? (raw as VerificationTab)
    : "pending";
}

export function formatOrgLogDateTime(iso: string | null): string {
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

/** Review timeline from the org's side: submission → fraud hold → decision. */
export function getOrgLogTimelineSteps(log: OrgShiftLog): OrgLogTimelineStep[] {
  const completed = formatOrgLogDateTime(log.completedAt);

  const steps: OrgLogTimelineStep[] = [
    {
      id: "submitted",
      label:
        log.method === "qr"
          ? "Checked in with shift QR"
          : "Manual claim submitted",
      detail: completed,
      complete: true,
    },
  ];

  if (log.status === "flagged") {
    steps.push({
      id: "flagged",
      label: "Held by fraud check",
      detail: log.flagReason ?? "Held for review per school policy.",
      complete: true,
    });
    steps.push({
      id: "decision",
      label: "Awaiting your decision",
      detail: "Approve or reject after a closer look",
      complete: false,
    });
  } else if (log.status === "pending") {
    steps.push({
      id: "decision",
      label: "Awaiting your decision",
      detail: "Students usually hear back within 24 hours",
      complete: false,
    });
  } else if (log.status === "verified") {
    steps.push({
      id: "decision",
      label: "Verified by you",
      detail: formatOrgLogDateTime(log.verifiedAt),
      complete: true,
    });
  } else {
    steps.push({
      id: "decision",
      label: "Rejected",
      detail: log.rejectReason ?? "Rejected after moderator review.",
      complete: true,
    });
  }

  return steps;
}

export function getOrgLogHeroGradient(status: OrgLogStatus): string {
  if (status === "verified") {
    return "linear-gradient(135deg, #DDEDF5 0%, rgba(11, 143, 136, 0.28) 100%)";
  }
  if (status === "pending") {
    return "linear-gradient(135deg, #FBF6E4 0%, rgba(232, 169, 61, 0.4) 100%)";
  }
  if (status === "flagged") {
    return "linear-gradient(135deg, #F9E3EA 0%, rgba(224, 73, 46, 0.25) 100%)";
  }
  return "linear-gradient(135deg, #ECE9E0 0%, rgba(111, 106, 94, 0.2) 100%)";
}

export interface OrgLogFilters {
  tab: VerificationTab;
  q?: string;
  shiftId?: string;
}

export function filterOrgLogs(
  logs: OrgShiftLog[],
  { tab, q, shiftId }: OrgLogFilters,
): OrgShiftLog[] {
  let filtered = logs.filter((log) => {
    if (tab === "pending") return log.status === "pending";
    if (tab === "flagged") return log.status === "flagged";
    return log.status === "verified" || log.status === "rejected";
  });

  if (shiftId) {
    filtered = filtered.filter((log) => log.shiftId === shiftId);
  }

  const query = q?.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(
      (log) =>
        log.studentName.toLowerCase().includes(query) ||
        log.shiftTitle.toLowerCase().includes(query) ||
        log.school.toLowerCase().includes(query),
    );
  }

  return filtered;
}
