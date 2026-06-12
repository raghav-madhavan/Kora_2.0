import { shifts, student } from "@/lib/mock-data";
import {
  getAllHoursLogs,
  upsertHoursLog,
} from "@/lib/student-hours-server";
import { appendServerNotification } from "@/lib/mock-notifications-server";
import type { OrgShiftLog } from "@/lib/types/moderator";
import type { LogStatus, ShiftLog, StudentProfile } from "@/lib/types/student";

function mapOrgStatusToStudent(status: OrgShiftLog["status"]): LogStatus {
  if (status === "rejected") {
    return "rejected";
  }
  return status;
}

export function orgLogToShiftLog(
  orgLog: OrgShiftLog,
  studentLogId?: string,
): ShiftLog {
  const shift = shifts.find((item) => item.id === orgLog.shiftId);
  const id = studentLogId ?? orgLog.studentLogId ?? orgLog.id;

  return {
    id,
    shiftId: orgLog.shiftId,
    org: shift?.org ?? "City Parks Dept.",
    date: orgLog.date,
    category: orgLog.category,
    categoryKey: orgLog.categoryKey,
    categoryTint: orgLog.categoryTint,
    activity: orgLog.shiftTitle,
    hours: orgLog.hours,
    status: mapOrgStatusToStudent(orgLog.status),
    avatar: shift?.img ?? orgLog.studentAvatar,
    qrToken: orgLog.method === "qr" ? "kora.v1.qr_checkin" : null,
    qrExpiresAt: null,
    verifiedAt: orgLog.verifiedAt,
    verifiedByModeratorId: orgLog.verifiedByModeratorId,
    flagReason: orgLog.flagReason,
    rejectReason: orgLog.rejectReason,
    completedAt: orgLog.completedAt,
  };
}

export function resolveStudentLogId(
  orgLog: OrgShiftLog,
  existingLogs: ShiftLog[],
): string | undefined {
  if (orgLog.studentLogId) {
    return orgLog.studentLogId;
  }

  const match = existingLogs.find(
    (log) =>
      log.shiftId === orgLog.shiftId &&
      log.completedAt === orgLog.completedAt,
  );

  return match?.id;
}

export function syncOrgDecisionToStudent(orgLog: OrgShiftLog): ShiftLog | null {
  if (orgLog.studentId !== student.id) {
    return null;
  }

  const existingLogs = getAllHoursLogs();
  const studentLogId = resolveStudentLogId(orgLog, existingLogs);
  const shiftLog = orgLogToShiftLog(orgLog, studentLogId);
  const updated = upsertHoursLog(shiftLog);

  if (orgLog.status === "verified") {
    appendServerNotification({
      id: `notif_verified_${orgLog.id}_${Date.now()}`,
      kind: "hours_verified",
      title: "Hours verified",
      body: `${orgLog.shiftTitle} · +${orgLog.hours} hrs approved by your org moderator.`,
      read: false,
      createdAt: new Date().toISOString(),
      href: `/hours/${updated.id}`,
    });
  }

  return updated;
}

export function buildOrgLogFromQrScan(
  shiftLog: ShiftLog,
  studentProfile: StudentProfile,
  orgLogId: string,
): OrgShiftLog {
  return {
    id: orgLogId,
    shiftId: shiftLog.shiftId,
    shiftTitle: shiftLog.activity,
    studentId: studentProfile.id,
    studentName: studentProfile.name,
    studentAvatar: studentProfile.avatar,
    school: "Lincoln High",
    category: shiftLog.category,
    categoryKey: shiftLog.categoryKey,
    categoryTint: shiftLog.categoryTint,
    date: shiftLog.date,
    completedAt: shiftLog.completedAt,
    hours: shiftLog.hours,
    status: "pending",
    method: "qr",
    verifiedAt: null,
    studentLogId: shiftLog.id,
  };
}

export function createPairedLogsFromQrScan(
  shiftLog: ShiftLog,
  studentProfile: StudentProfile = student,
): { shiftLog: ShiftLog; orgLog: OrgShiftLog } {
  const pendingLog: ShiftLog = {
    ...shiftLog,
    status: "pending",
    verifiedAt: null,
    verifiedByModeratorId: undefined,
  };

  const orgLogId = `orglog_scan_${pendingLog.id}`;
  const orgLog = buildOrgLogFromQrScan(pendingLog, studentProfile, orgLogId);

  return { shiftLog: pendingLog, orgLog };
}
