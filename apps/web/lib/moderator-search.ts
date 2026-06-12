import { moderatorShifts } from "@/lib/mock-data-moderator";
import type { ModeratorShift, OrgShiftLog } from "@/lib/types/moderator";

export interface OrgStudentResult {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  school: string;
  claimCount: number;
  totalHours: number;
  /** Queue tab where this student's claims are most relevant. */
  defaultTab: "pending" | "flagged" | "history";
}

export function searchModeratorShifts(query: string): ModeratorShift[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  return moderatorShifts.filter(
    (shift) =>
      shift.title.toLowerCase().includes(q) ||
      shift.location.toLowerCase().includes(q) ||
      shift.category.toLowerCase().includes(q),
  );
}

/** Distinct students who have submitted claims to the org, matched by name or school. */
export function searchOrgStudents(
  query: string,
  logs: OrgShiftLog[],
): OrgStudentResult[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const byStudent = new Map<string, OrgStudentResult>();
  for (const log of logs) {
    const tabForLog =
      log.status === "pending"
        ? "pending"
        : log.status === "flagged"
          ? "flagged"
          : "history";
    const existing = byStudent.get(log.studentId);
    if (existing) {
      existing.claimCount += 1;
      existing.totalHours += log.hours;
      // Pending beats flagged beats history when picking a landing tab.
      if (
        tabForLog === "pending" ||
        (tabForLog === "flagged" && existing.defaultTab === "history")
      ) {
        existing.defaultTab = tabForLog;
      }
    } else {
      byStudent.set(log.studentId, {
        studentId: log.studentId,
        studentName: log.studentName,
        studentAvatar: log.studentAvatar,
        school: log.school,
        claimCount: 1,
        totalHours: log.hours,
        defaultTab: tabForLog,
      });
    }
  }

  return [...byStudent.values()].filter(
    (student) =>
      student.studentName.toLowerCase().includes(q) ||
      student.school.toLowerCase().includes(q),
  );
}

export function searchOrgClaims(
  query: string,
  logs: OrgShiftLog[],
): OrgShiftLog[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  return logs.filter(
    (log) =>
      log.studentName.toLowerCase().includes(q) ||
      log.shiftTitle.toLowerCase().includes(q) ||
      log.school.toLowerCase().includes(q),
  );
}
