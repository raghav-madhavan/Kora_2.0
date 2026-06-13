import { describe, expect, it } from "vitest";
import { mergeOrgLogs, reconcileOverlay } from "@/lib/org-logs-store";
import type { OrgShiftLog } from "@/lib/types/moderator";

function makeLog(overrides: Partial<OrgShiftLog> & Pick<OrgShiftLog, "id">): OrgShiftLog {
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
    completedAt: "2026-06-01T00:00:00.000Z",
    hours: 3,
    status: "pending",
    method: "manual",
    verifiedAt: null,
    ...overrides,
  };
}

describe("mergeOrgLogs", () => {
  it("overlays decided logs on top of the server seed, newest completed first", () => {
    const seed = [
      makeLog({ id: "a", completedAt: "2026-06-01T00:00:00.000Z", status: "pending" }),
      makeLog({ id: "b", completedAt: "2026-06-05T00:00:00.000Z", status: "pending" }),
    ];
    const overlay = [
      makeLog({ id: "a", completedAt: "2026-06-01T00:00:00.000Z", status: "verified" }),
    ];
    const merged = mergeOrgLogs(seed, overlay);
    expect(merged.map((l) => l.id)).toEqual(["b", "a"]);
    expect(merged.find((l) => l.id === "a")?.status).toBe("verified");
  });
});

describe("reconcileOverlay (server wins on conflict)", () => {
  it("keeps an optimistic overlay while the server seed is still pending", () => {
    const server = [makeLog({ id: "a", status: "pending", decidedAt: null })];
    const overlay = [
      makeLog({ id: "a", status: "verified", decidedAt: "2026-06-10T00:00:00.000Z" }),
    ];
    expect(reconcileOverlay(server, overlay).map((l) => l.id)).toEqual(["a"]);
  });

  it("prunes an overlay once the server has caught up with a newer decision", () => {
    const server = [
      makeLog({ id: "a", status: "rejected", decidedAt: "2026-06-11T00:00:00.000Z" }),
    ];
    const overlay = [
      makeLog({ id: "a", status: "verified", decidedAt: "2026-06-10T00:00:00.000Z" }),
    ];
    expect(reconcileOverlay(server, overlay)).toHaveLength(0);
  });

  it("keeps overlay entries that have no server counterpart", () => {
    const server: OrgShiftLog[] = [];
    const overlay = [makeLog({ id: "scanned", status: "pending" })];
    expect(reconcileOverlay(server, overlay).map((l) => l.id)).toEqual([
      "scanned",
    ]);
  });
});
