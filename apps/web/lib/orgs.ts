import { organizations, shifts } from "@/lib/mock-data";
import type { Organization, Shift } from "@/lib/types/student";

export function getOrgById(id: string): Organization | undefined {
  return organizations.find((org) => org.id === id);
}

export function getShiftsForOrg(orgId: string, allShifts?: Shift[]): Shift[] {
  const list = allShifts ?? shifts;
  return list.filter((shift) => shift.orgId === orgId);
}
