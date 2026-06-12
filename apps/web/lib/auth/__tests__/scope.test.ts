import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  assertMacro,
  assertShiftAccess,
  canAccessShift,
  scopeLogs,
  scopeShifts,
} from "@/lib/auth/scope";
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

describe("canAccessShift / assertShiftAccess", () => {
  it("macro can access any org shift", () => {
    expect(canAccessShift(macro, "shift_parks_trail_may")).toBe(true);
    expect(() => assertShiftAccess(macro, "shift_parks_trail_may")).not.toThrow();
  });

  it("micro can access only assigned shifts", () => {
    expect(canAccessShift(micro, "shift_riverside_cleanup")).toBe(true);
    expect(canAccessShift(micro, "shift_parks_trail_may")).toBe(false);
    expect(() => assertShiftAccess(micro, "shift_parks_trail_may")).toThrow(
      AuthorizationError,
    );
  });
});

describe("scopeShifts / scopeLogs", () => {
  const shifts = [
    { id: "shift_riverside_cleanup" },
    { id: "shift_parks_trail_may" },
  ];
  const logs = [
    { id: "a", shiftId: "shift_riverside_cleanup" },
    { id: "b", shiftId: "shift_parks_trail_may" },
  ];

  it("returns everything for macro", () => {
    expect(scopeShifts(macro, shifts)).toHaveLength(2);
    expect(scopeLogs(macro, logs)).toHaveLength(2);
  });

  it("filters to assigned shifts for micro", () => {
    expect(scopeShifts(micro, shifts).map((s) => s.id)).toEqual([
      "shift_riverside_cleanup",
    ]);
    expect(scopeLogs(micro, logs).map((l) => l.id)).toEqual(["a"]);
  });
});

describe("assertMacro", () => {
  it("passes macro, throws AuthorizationError for micro", () => {
    expect(() => assertMacro(macro)).not.toThrow();
    expect(() => assertMacro(micro)).toThrow(AuthorizationError);
  });
});
