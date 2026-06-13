import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAuditLogForTests,
  getAuditEntriesForLog,
  getRecentAuditEntries,
  recordAuditEntry,
} from "@/lib/moderator-audit-log";
import type { ModeratorSession } from "@/lib/auth/session";

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
  shiftIds: ["shift_riverside_cleanup"],
};

describe("moderator-audit-log", () => {
  beforeEach(() => {
    __resetAuditLogForTests();
  });

  it("records an entry with a generated id and timestamp", () => {
    const entry = recordAuditEntry({
      logId: "log_1",
      shiftId: "shift_riverside_cleanup",
      action: "approve",
      moderatorId: "mod_parks",
    });
    expect(entry.id).toMatch(/^audit_/);
    expect(typeof entry.timestamp).toBe("string");
    expect(entry.action).toBe("approve");
  });

  it("returns entries for one log, newest first", () => {
    recordAuditEntry({ logId: "log_1", shiftId: "s1", action: "reject", moderatorId: "m", reason: "first" });
    recordAuditEntry({ logId: "log_1", shiftId: "s1", action: "approve", moderatorId: "m" });
    recordAuditEntry({ logId: "log_2", shiftId: "s1", action: "approve", moderatorId: "m" });

    const entries = getAuditEntriesForLog("log_1");
    expect(entries).toHaveLength(2);
    expect(entries[0]?.action).toBe("approve");
    expect(entries[1]?.reason).toBe("first");
  });

  it("scopes recent entries to a micro session's shifts", () => {
    recordAuditEntry({ logId: "log_a", shiftId: "shift_riverside_cleanup", action: "approve", moderatorId: "m" });
    recordAuditEntry({ logId: "log_b", shiftId: "shift_parks_trail_may", action: "approve", moderatorId: "m" });

    expect(getRecentAuditEntries(macro)).toHaveLength(2);
    const microEntries = getRecentAuditEntries(micro);
    expect(microEntries).toHaveLength(1);
    expect(microEntries[0]?.logId).toBe("log_a");
  });

  it("honors the recent-entry limit", () => {
    for (let i = 0; i < 5; i += 1) {
      recordAuditEntry({ logId: `log_${i}`, shiftId: "shift_riverside_cleanup", action: "approve", moderatorId: "m" });
    }
    expect(getRecentAuditEntries(macro, 3)).toHaveLength(3);
  });
});
