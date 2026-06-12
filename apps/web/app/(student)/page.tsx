import dynamic from "next/dynamic";
import { PageShell } from "@/components/student/page-shell";
import { HoursTable } from "@/components/student/hours-table";
import { DashboardNextAction } from "@/components/student/dashboard-next-action";

const RequirementsCarousel = dynamic(
  () =>
    import("@/components/student/requirements-carousel").then((mod) => ({
      default: mod.RequirementsCarousel,
    })),
  {
    loading: () => (
      <div className="mb-6 h-[320px] animate-pulse rounded-card bg-surface shadow-card" />
    ),
  },
);

const ShiftsCarousel = dynamic(
  () =>
    import("@/components/student/shifts-carousel").then((mod) => ({
      default: mod.ShiftsCarousel,
    })),
  {
    loading: () => (
      <div className="mb-9 h-[280px] animate-pulse rounded-card bg-surface shadow-card" />
    ),
  },
);

export default function StudentDashboardPage() {
  return (
    <PageShell showRightRail>
      <div className="flex flex-col gap-5">
        <DashboardNextAction />
        <RequirementsCarousel />
        <ShiftsCarousel />
        <HoursTable />
      </div>
    </PageShell>
  );
}
