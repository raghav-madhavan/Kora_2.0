import type {
  CategoryKey,
  ChatMessage,
  LogStatus,
  OrgModerator,
  TintKey,
} from "@/lib/types/student";

/** Org-side log status — includes rejected decisions from moderators. */
export type OrgLogStatus = LogStatus;

export type CheckInMethod = "qr" | "manual";

/** An hours claim as the org sees it: one student, one shift, one decision. */
export interface OrgShiftLog {
  id: string;
  shiftId: string;
  shiftTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  school: string;
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  date: string;
  completedAt: string;
  hours: number;
  status: OrgLogStatus;
  method: CheckInMethod;
  verifiedAt: string | null;
  verifiedByModeratorId?: string;
  /** Set on reject; mirrors the future ShiftLog.rejectedBy column. */
  rejectedByModeratorId?: string;
  /**
   * When a terminal decision (approve/reject) was made. Null while pending or
   * flagged. Used for audit display and for server-wins overlay reconciliation.
   */
  decidedAt?: string | null;
  flagReason?: string;
  rejectReason?: string;
  /** Links to ShiftLog.id when a student-side row exists. */
  studentLogId?: string;
}

/** Terminal moderator decisions captured for district / FERPA review. */
export type ModeratorAuditAction = "approve" | "reject";

/**
 * Immutable record of one moderator decision. Mirrors the future
 * `ModeratorAuditEntry` Prisma table — append-only, never updated in place.
 */
export interface ModeratorAuditEntry {
  id: string;
  logId: string;
  /** Scoping seam: lets us filter audit reads by a session's shift access. */
  shiftId: string;
  action: ModeratorAuditAction;
  moderatorId: string;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, string>;
}

export interface ModeratorShift {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  date: string;
  scheduledAt: string;
  slots: number;
  committedCount: number;
  checkedInCount: number;
  hours: number;
  location: string;
  img: string;
  status: "upcoming" | "completed";
}

export interface ModeratorProfile extends OrgModerator {
  orgId: string;
  orgName: string;
  orgAvatar: string;
}

export type ModeratorNotificationKind =
  | "claim_pending"
  | "claim_flagged"
  | "message_received";

export interface ModeratorNotification {
  id: string;
  kind: ModeratorNotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

/** Student ↔ org moderator thread as Elena sees it in the inbox. */
export interface OrgInboxThread {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  school: string;
  shiftId: string;
  shiftTitle: string;
  shiftDate: string;
  unread: boolean;
  messages: ChatMessage[];
  updatedAt: string;
}
