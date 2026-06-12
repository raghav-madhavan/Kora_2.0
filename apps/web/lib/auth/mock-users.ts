/**
 * Mock persona table backing /login. Deleted when Clerk replaces mock auth.
 */

import type { Session } from "@/lib/auth/session";
import { student } from "@/lib/mock-data";
import {
  currentModerator,
  microModerator,
} from "@/lib/mock-data-moderator";

export interface MockPersona {
  id: string;
  name: string;
  roleLine: string;
  avatar: string;
  session: Session;
}

export const personas: readonly MockPersona[] = [
  {
    id: "student",
    name: student.name,
    roleLine: "Student · Lincoln High",
    avatar: student.avatar,
    session: { role: "STUDENT", userId: student.id },
  },
  {
    id: "macro",
    name: currentModerator.name,
    roleLine: "Lead moderator · City Parks Dept.",
    avatar: currentModerator.avatar,
    session: {
      role: "ORG_MODERATOR",
      access: "macro",
      userId: currentModerator.id,
      orgId: currentModerator.orgId,
    },
  },
  {
    id: "micro",
    name: microModerator.name,
    roleLine: "Shift moderator · Riverside Park Cleanup",
    avatar: microModerator.avatar,
    session: {
      role: "ORG_MODERATOR",
      access: "micro",
      userId: microModerator.id,
      orgId: microModerator.orgId,
      shiftIds: ["shift_riverside_cleanup"],
    },
  },
];

export function getPersona(id: string): MockPersona | undefined {
  return personas.find((persona) => persona.id === id);
}
