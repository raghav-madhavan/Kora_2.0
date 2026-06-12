import { describe, expect, it } from "vitest";
import {
  parseSession,
  serializeSession,
  type Session,
} from "@/lib/auth/session";

const macro: Session = {
  role: "ORG_MODERATOR",
  access: "macro",
  userId: "mod_parks",
  orgId: "org_city_parks",
};

const micro: Session = {
  role: "ORG_MODERATOR",
  access: "micro",
  userId: "mod_parks_riverside",
  orgId: "org_city_parks",
  shiftIds: ["shift_riverside_cleanup"],
};

const student: Session = { role: "STUDENT", userId: "user_maya_chen" };

describe("parseSession", () => {
  it("round-trips macro, micro, and student sessions", () => {
    expect(parseSession(serializeSession(macro))).toEqual(macro);
    expect(parseSession(serializeSession(micro))).toEqual(micro);
    expect(parseSession(serializeSession(student))).toEqual(student);
  });

  it("returns null for missing or garbage input", () => {
    expect(parseSession(undefined)).toBeNull();
    expect(parseSession("")).toBeNull();
    expect(parseSession("not-json")).toBeNull();
    expect(parseSession("42")).toBeNull();
    expect(parseSession("null")).toBeNull();
  });

  it("returns null for structurally invalid sessions", () => {
    expect(parseSession(JSON.stringify({ role: "ADMIN", userId: "x" }))).toBeNull();
    expect(parseSession(JSON.stringify({ role: "STUDENT" }))).toBeNull();
    expect(
      parseSession(
        JSON.stringify({ role: "ORG_MODERATOR", access: "macro", userId: "x" }),
      ),
    ).toBeNull(); // missing orgId
    expect(
      parseSession(
        JSON.stringify({
          role: "ORG_MODERATOR",
          access: "micro",
          userId: "x",
          orgId: "y",
        }),
      ),
    ).toBeNull(); // missing shiftIds
    expect(
      parseSession(
        JSON.stringify({
          role: "ORG_MODERATOR",
          access: "micro",
          userId: "x",
          orgId: "y",
          shiftIds: [1, 2],
        }),
      ),
    ).toBeNull(); // non-string shiftIds
  });
});
