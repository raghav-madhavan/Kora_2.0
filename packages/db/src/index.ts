export { prisma } from "./client";
export * from "./queries/school";
export * from "./queries/shift-log";
export * from "./queries/fraud";
export * from "./queries/user";

export type { Role, User, School, Organization, Shift, ShiftLog } from "@prisma/client";
