export type CategoryKey = "community" | "environment" | "education";
export type TintKey = "lavender" | "pink" | "sky";
export type LogStatus = "verified" | "pending" | "flagged";

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
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  date: string;
  scheduledAt: string;
  spotsLeft: number;
  slots: number;
  hours: number;
  img: string;
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
  completedAt: string;
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
