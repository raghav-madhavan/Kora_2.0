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

export type OrgLogSort = "newest" | "oldest" | "hours-desc";

const SORT_VALUES: OrgLogSort[] = ["newest", "oldest", "hours-desc"];

export function toOrgLogSort(raw: string | null): OrgLogSort | null {
  return SORT_VALUES.includes(raw as OrgLogSort) ? (raw as OrgLogSort) : null;
}

function completedTime(log: OrgShiftLog): number {
  return new Date(log.completedAt).getTime();
}

/**
 * Triage ordering. `oldest` surfaces the longest-waiting claim first so SLAs
 * stay visible; `hours-desc` puts the highest-impact decisions up top. Sort is
 * pure and stable on ties (falls back to oldest-first).
 */
export function sortOrgLogs(
  logs: OrgShiftLog[],
  mode: OrgLogSort,
): OrgShiftLog[] {
  const copy = [...logs];
  if (mode === "oldest") {
    return copy.sort((a, b) => completedTime(a) - completedTime(b));
  }
  if (mode === "hours-desc") {
    return copy.sort(
      (a, b) => b.hours - a.hours || completedTime(a) - completedTime(b),
    );
  }
  return copy.sort((a, b) => completedTime(b) - completedTime(a));
}

export interface FraudCluster {
  key: string;
  shiftId: string;
  shiftTitle: string;
  hours: number;
  flagReason: string;
  logs: OrgShiftLog[];
  logIds: string[];
}

/**
 * Detect fraud clusters from flagged claims: 3+ students logging identical
 * unverified hours on the same shift with the same hold reason. Mirrors the
 * product rule (3+ identical unverified hours within 10 minutes) on the
 * existing `flagReason` seam — no live fraud engine required.
 */
export function groupFlaggedByReason(
  logs: OrgShiftLog[],
  minSize = 3,
): FraudCluster[] {
  const groups = new Map<string, OrgShiftLog[]>();

  for (const log of logs) {
    if (log.status !== "flagged" || !log.flagReason) continue;
    const key = `${log.shiftId}|${log.hours}|${log.flagReason}`;
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(log);
    } else {
      groups.set(key, [log]);
    }
  }

  const clusters: FraudCluster[] = [];
  for (const [key, members] of groups) {
    const first = members[0];
    if (members.length < minSize || !first) continue;
    clusters.push({
      key,
      shiftId: first.shiftId,
      shiftTitle: first.shiftTitle,
      hours: first.hours,
      flagReason: first.flagReason ?? "",
      logs: members,
      logIds: members.map((m) => m.id),
    });
  }

  // Largest cluster first — the most urgent mitigation.
  return clusters.sort((a, b) => b.logs.length - a.logs.length);
}
