export type CategoryKey = "community" | "environment" | "education";

export interface VerifiedLog {
  hours: number;
  verifiedAt: Date | null;
  categoryKey?: CategoryKey;
}

export interface MockShiftLog {
  hours: number;
  status: "verified" | "pending" | "flagged";
  categoryKey: CategoryKey;
}
