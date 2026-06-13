import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/lib/auth/scope";
import type { ModeratorSession } from "@/lib/auth/session";
import { getAuditEntriesForLog } from "@/lib/moderator-audit-log";
import {
  approveOrgLogs,
  getOrgLogById,
  rejectOrgLog,
  rejectOrgLogs,
} from "@/lib/mock-store-server-moderator";

const macro: ModeratorSession = {
  role: "ORG_MODERATOR",
  access: "macro",
  userId: "mod_parks",
  orgId: "org_city_parks",
};

const micro: ModeratorSession = {
  role: "ORG_MODERATOR",
  access: "micro",
  userId: "mod_parks_riverside",
  orgId: "org_city_parks",
  // Only staffs the Riverside cleanup shift.
  shiftIds: ["shift_riverside_cleanup"],
};

// In seed: orglog_maya_jun7 → shift_riverside_cleanup (micro-visible),
// orglog_aisha_jun7 / orglog_leo_jun7 → shift_parks_trail_may (out of micro scope).

describe("batch approve", () => {
  it("macro batch-approves and writes decision metadata + audit entries", () => {
    const [updated] = approveOrgLogs(macro, ["orglog_maya_jun7"]);
    expect(updated?.status).toBe("verified");
    expect(updated?.verifiedByModeratorId).toBe("mod_parks");
    expect(typeof updated?.decidedAt).toBe("string");

    const audit = getAuditEntriesForLog("orglog_maya_jun7");
    expect(audit.some((entry) => entry.action === "approve")).toBe(true);
  });
});

describe("micro scope enforcement", () => {
  it("rejects a single out-of-scope approve", () => {
    expect(() => getOrgLogById(micro, "orglog_aisha_jun7")).not.toThrow();
    // Out-of-scope reads come back undefined (probing leaks nothing).
    expect(getOrgLogById(micro, "orglog_aisha_jun7")).toBeUndefined();
  });

  it("throws before mutating when a batch contains an out-of-scope id", () => {
    expect(() =>
      approveOrgLogs(micro, ["orglog_maya_jun7", "orglog_aisha_jun7"]),
    ).toThrow(AuthorizationError);

    // The out-of-scope claim must remain untouched (verified via macro read).
    expect(getOrgLogById(macro, "orglog_aisha_jun7")?.status).toBe("pending");
  });
});

describe("reject requires a reason", () => {
  it("throws on a blank single reject reason", () => {
    expect(() => rejectOrgLog(macro, "orglog_leo_jun7", "   ")).toThrow();
    expect(getOrgLogById(macro, "orglog_leo_jun7")?.status).toBe("pending");
  });

  it("throws on a blank batch reject reason", () => {
    expect(() => rejectOrgLogs(macro, ["orglog_leo_jun7"], "")).toThrow();
  });

  it("batch-rejects with metadata and an audit entry when a reason is given", () => {
    const [updated] = rejectOrgLogs(
      macro,
      ["orglog_leo_jun7"],
      "No check-in record for this date.",
    );
    expect(updated?.status).toBe("rejected");
    expect(updated?.rejectedByModeratorId).toBe("mod_parks");
    expect(updated?.rejectReason).toBe("No check-in record for this date.");
    expect(typeof updated?.decidedAt).toBe("string");

    const audit = getAuditEntriesForLog("orglog_leo_jun7");
    expect(audit[0]?.action).toBe("reject");
    expect(audit[0]?.reason).toBe("No check-in record for this date.");
  });
});
