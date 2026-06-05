import { PageShell } from "@/components/student/page-shell";
import { Hero } from "@/components/student/hero";
import { CategoryCards } from "@/components/student/category-cards";
import { ShiftsCarousel } from "@/components/student/shifts-carousel";
import { HoursTable } from "@/components/student/hours-table";

export default function StudentDashboardPage() {
  return (
    <PageShell showRightRail>
      <Hero />
      <CategoryCards />
      <ShiftsCarousel />
      <HoursTable />
    </PageShell>
  );
}
