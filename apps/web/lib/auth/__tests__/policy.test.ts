import { describe, expect, it } from "vitest";
import {
  filterModeratorNav,
  isModeratorPathAllowed,
  portalHome,
  resolveRedirect,
} from "@/lib/auth/policy";
import type { Session } from "@/lib/auth/session";

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

const microMulti: Session = {
  ...micro,
  shiftIds: ["shift_riverside_cleanup", "shift_parks_native_garden"],
} as Session;

const student: Session = { role: "STUDENT", userId: "user_maya_chen" };

describe("portalHome", () => {
  it("routes each session type to its home", () => {
    expect(portalHome(student)).toBe("/");
    expect(portalHome(macro)).toBe("/moderator");
    expect(portalHome(micro)).toBe("/moderator/shifts/shift_riverside_cleanup");
    expect(portalHome(microMulti)).toBe("/moderator/shifts");
  });
});

describe("isModeratorPathAllowed", () => {
  it("allows macro everywhere in the portal", () => {
    expect(isModeratorPathAllowed(macro, "/moderator")).toBe(true);
    expect(isModeratorPathAllowed(macro, "/moderator/search")).toBe(true);
  });

  it("blocks micro from macro-only prefixes", () => {
    expect(isModeratorPathAllowed(micro, "/moderator")).toBe(false);
    expect(isModeratorPathAllowed(micro, "/moderator/search")).toBe(false);
    expect(isModeratorPathAllowed(micro, "/moderator/messages")).toBe(false);
    expect(isModeratorPathAllowed(micro, "/moderator/profile")).toBe(false);
  });

  it("allows micro on shifts and verifications", () => {
    expect(isModeratorPathAllowed(micro, "/moderator/shifts")).toBe(true);
    expect(isModeratorPathAllowed(micro, "/moderator/shifts/anything")).toBe(true);
    expect(isModeratorPathAllowed(micro, "/moderator/verifications")).toBe(true);
    expect(isModeratorPathAllowed(micro, "/moderator/verifications/x")).toBe(true);
  });
});

describe("resolveRedirect", () => {
  it("sends logged-out users to /login and leaves /login alone", () => {
    expect(resolveRedirect(null, "/")).toBe("/login");
    expect(resolveRedirect(null, "/moderator")).toBe("/login");
    expect(resolveRedirect(null, "/login")).toBeNull();
  });

  it("sends logged-in users away from /login to their home", () => {
    expect(resolveRedirect(student, "/login")).toBe("/");
    expect(resolveRedirect(macro, "/login")).toBe("/moderator");
    expect(resolveRedirect(micro, "/login")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
  });

  it("keeps students out of the org portal", () => {
    expect(resolveRedirect(student, "/")).toBeNull();
    expect(resolveRedirect(student, "/hours")).toBeNull();
    expect(resolveRedirect(student, "/moderator")).toBe("/");
    expect(resolveRedirect(student, "/moderator/shifts/x")).toBe("/");
  });

  it("keeps moderators out of the student portal", () => {
    expect(resolveRedirect(macro, "/")).toBe("/moderator");
    expect(resolveRedirect(micro, "/hours")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
  });

  it("redirects micro off macro-only routes to their home", () => {
    expect(resolveRedirect(micro, "/moderator")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
    expect(resolveRedirect(micro, "/moderator/messages")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
    expect(resolveRedirect(micro, "/moderator/shifts")).toBeNull();
    expect(resolveRedirect(micro, "/moderator/verifications/log_x")).toBeNull();
    expect(resolveRedirect(macro, "/moderator/search")).toBeNull();
  });
});

describe("filterModeratorNav", () => {
  const items = [
    { label: "Dashboard", href: "/moderator" },
    { label: "Verifications", href: "/moderator/verifications" },
    { label: "Shifts", href: "/moderator/shifts" },
    { label: "Messages", href: "/moderator/messages" },
  ];

  it("keeps everything for macro", () => {
    expect(filterModeratorNav(macro, items)).toHaveLength(4);
  });

  it("drops macro-only entries for micro", () => {
    expect(filterModeratorNav(micro, items).map((i) => i.label)).toEqual([
      "Verifications",
      "Shifts",
    ]);
  });
});
