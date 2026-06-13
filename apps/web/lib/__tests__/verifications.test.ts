import { describe, expect, it } from "vitest";
import {
  filterOrgLogs,
  groupFlaggedByReason,
  sortOrgLogs,
} from "@/lib/verifications";
import type { OrgShiftLog } from "@/lib/types/moderator";

function makeLog(
  overrides: Partial<OrgShiftLog> &
    Pick<OrgShiftLog, "id" | "completedAt" | "hours" | "status">,
): OrgShiftLog {
  return {
    shiftId: "shift_1",
    shiftTitle: "Trail Restoration",
    studentId: "student_1",
    studentName: "Sample Student",
    studentAvatar: "",
    school: "Lincoln High",
    category: "Environment",
    categoryKey: "environment",
    categoryTint: "sky",
    date: "Jun 1, 2026",
    method: "manual",
    verifiedAt: null,
    ...overrides,
  };
}

const FLAG = "3 students logged identical unverified hours within 10 minutes.";

describe("sortOrgLogs", () => {
  const logs: OrgShiftLog[] = [
    makeLog({ id: "a", completedAt: "2026-06-07T17:00:00.000Z", hours: 4, status: "pending" }),
    makeLog({ id: "b", completedAt: "2026-06-05T09:00:00.000Z", hours: 2, status: "pending" }),
    makeLog({ id: "c", completedAt: "2026-06-09T12:00:00.000Z", hours: 6, status: "pending" }),
  ];

  it("orders oldest first for SLA visibility", () => {
    expect(sortOrgLogs(logs, "oldest").map((l) => l.id)).toEqual(["b", "a", "c"]);
  });

  it("orders newest first", () => {
    expect(sortOrgLogs(logs, "newest").map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("orders by most hours, oldest as tie-breaker", () => {
    const tie: OrgShiftLog[] = [
      makeLog({ id: "x", completedAt: "2026-06-09T00:00:00.000Z", hours: 3, status: "pending" }),
      makeLog({ id: "y", completedAt: "2026-06-01T00:00:00.000Z", hours: 3, status: "pending" }),
      makeLog({ id: "z", completedAt: "2026-06-05T00:00:00.000Z", hours: 5, status: "pending" }),
    ];
    expect(sortOrgLogs(tie, "hours-desc").map((l) => l.id)).toEqual(["z", "y", "x"]);
  });

  it("does not mutate the input array", () => {
    const input = [...logs];
    sortOrgLogs(input, "oldest");
    expect(input.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });
});

describe("filterOrgLogs + sortOrgLogs combo", () => {
  const logs: OrgShiftLog[] = [
    makeLog({ id: "p1", completedAt: "2026-06-07T00:00:00.000Z", hours: 4, status: "pending" }),
    makeLog({ id: "p2", completedAt: "2026-06-03T00:00:00.000Z", hours: 2, status: "pending" }),
    makeLog({ id: "f1", completedAt: "2026-06-01T00:00:00.000Z", hours: 3, status: "flagged", flagReason: FLAG }),
    makeLog({ id: "v1", completedAt: "2026-06-09T00:00:00.000Z", hours: 5, status: "verified", verifiedAt: "2026-06-09T01:00:00.000Z" }),
  ];

  it("filters to the tab then sorts oldest-first", () => {
    const pending = filterOrgLogs(logs, { tab: "pending" });
    const sorted = sortOrgLogs(pending, "oldest");
    expect(sorted.map((l) => l.id)).toEqual(["p2", "p1"]);
  });

  it("history tab includes verified and rejected only", () => {
    const history = filterOrgLogs(logs, { tab: "history" });
    expect(history.map((l) => l.id)).toEqual(["v1"]);
  });
});

describe("groupFlaggedByReason", () => {
  const cluster: OrgShiftLog[] = [
    makeLog({ id: "c1", shiftId: "s_mulch", completedAt: "2026-04-12T16:02:00.000Z", hours: 3, status: "flagged", flagReason: FLAG }),
    makeLog({ id: "c2", shiftId: "s_mulch", completedAt: "2026-04-12T16:06:00.000Z", hours: 3, status: "flagged", flagReason: FLAG }),
    makeLog({ id: "c3", shiftId: "s_mulch", completedAt: "2026-04-12T16:09:00.000Z", hours: 3, status: "flagged", flagReason: FLAG }),
  ];

  it("detects a cluster of 3+ identical flagged claims", () => {
    const clusters = groupFlaggedByReason(cluster);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.logIds.sort()).toEqual(["c1", "c2", "c3"]);
    expect(clusters[0]?.hours).toBe(3);
  });

  it("ignores pending claims and below-threshold groups", () => {
    const mixed: OrgShiftLog[] = [
      ...cluster.slice(0, 2), // only 2 identical → below minSize
      makeLog({ id: "p", completedAt: "2026-04-12T16:00:00.000Z", hours: 3, status: "pending" }),
    ];
    expect(groupFlaggedByReason(mixed)).toHaveLength(0);
  });

  it("splits clusters by differing hours on the same shift", () => {
    const split: OrgShiftLog[] = [
      ...cluster,
      makeLog({ id: "d1", shiftId: "s_mulch", completedAt: "2026-04-12T16:10:00.000Z", hours: 5, status: "flagged", flagReason: FLAG }),
      makeLog({ id: "d2", shiftId: "s_mulch", completedAt: "2026-04-12T16:11:00.000Z", hours: 5, status: "flagged", flagReason: FLAG }),
    ];
    const clusters = groupFlaggedByReason(split);
    // 3 at 3hrs forms a cluster; 2 at 5hrs does not.
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.logIds).toHaveLength(3);
  });

  it("respects a custom minimum size", () => {
    const pair = cluster.slice(0, 2);
    expect(groupFlaggedByReason(pair, 2)).toHaveLength(1);
  });
});
