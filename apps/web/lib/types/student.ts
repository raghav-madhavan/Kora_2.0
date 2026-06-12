export type CategoryKey = "community" | "environment" | "education";
export type TintKey = "lavender" | "pink" | "sky";
export type LogStatus = "verified" | "pending" | "flagged" | "rejected";

export type AvatarHair =
  | "short"
  | "long"
  | "curly"
  | "ponytail"
  | "buzz"
  | "bangs"
  | "braids"
  | "spiky";
export type AvatarHairColor = "black" | "brown" | "blonde" | "red" | "auburn";
export type AvatarSkinTone = "light" | "medium" | "tan" | "brown" | "dark";
export type AvatarExpression =
  | "smile"
  | "neutral"
  | "excited"
  | "wink"
  | "laugh"
  | "cool";
export type AvatarBackground = "lavender" | "pink" | "sky" | "mint";
export type AvatarAccessory = "none" | "glasses" | "sunglasses";
export type AvatarHat =
  | "none"
  | "baseball-cap"
  | "beanie"
  | "graduation-cap"
  | "party-hat"
  | "crown";

export interface AvatarConfig {
  hair: AvatarHair;
  hairColor: AvatarHairColor;
  skinTone: AvatarSkinTone;
  expression: AvatarExpression;
  background: AvatarBackground;
  accessory: AvatarAccessory;
  hat: AvatarHat;
}

export interface StudentProfile {
  id: string;
  name: string;
  firstName: string;
  grade: string;
  avatar: string;
  schoolId: string;
  schoolState: string;
  skills: string[];
  hoursLogged: number;
  streakWeeks: number;
}

export interface Shift {
  id: string;
  title: string;
  description: string;
  org: string;
  orgId: string;
  moderatorId: string;
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  date: string;
  scheduledAt: string;
  spotsLeft: number;
  slots: number;
  hours: number;
  img: string;
  location: string;
  whatToBring: string[];
  saved: boolean;
  skills: string[];
  committed: boolean;
}

export interface ShiftLog {
  id: string;
  shiftId: string;
  org: string;
  date: string;
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  activity: string;
  hours: number;
  status: LogStatus;
  avatar: string;
  qrToken: string | null;
  qrExpiresAt: string | null;
  verifiedAt: string | null;
  verifiedByModeratorId?: string;
  flagReason?: string;
  rejectReason?: string;
  completedAt: string;
}

export interface OrgModerator {
  id: string;
  name: string;
  avatar: string;
  roleTitle: string;
  totalVerifications: number;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  categories: CategoryKey[];
  distance: string;
  verified: boolean;
  avatar: string;
  following: boolean;
  upcomingShifts: number;
  moderatorId: string;
}

export interface CategoryProgress {
  key: CategoryKey;
  label: string;
  logged: number;
  goal: number;
  tint: TintKey;
}

export interface Friend {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface MonthlyHours {
  label: string;
  value: number;
}

export type NotificationKind = "hours_verified" | "motivation" | "milestone";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export type MessageSenderRole = "student" | "friend" | "moderator";

export interface ChatMessage {
  id: string;
  sender: MessageSenderRole;
  body: string;
  sentAt: string;
}

export type ConversationKind = "friend" | "moderator";

export interface ConversationThread {
  id: string;
  kind: ConversationKind;
  pinned: boolean;
  unread: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  contactSubtitle: string;
  shiftId?: string;
  shiftTitle?: string;
  shiftDate?: string;
  messages: ChatMessage[];
  updatedAt: string;
}
