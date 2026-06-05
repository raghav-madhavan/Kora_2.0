import { Topbar } from "@/components/student/topbar";
import { Hero } from "@/components/student/hero";
import { CategoryCards } from "@/components/student/category-cards";
import { ShiftsCarousel } from "@/components/student/shifts-carousel";
import { HoursTable } from "@/components/student/hours-table";
import { RightRail } from "@/components/student/right-rail";

export default function StudentDashboardPage() {
  return (
    <div className="flex min-w-0 flex-1">
      <main className="min-w-0 flex-1 px-8 pb-12 pt-7">
        <Topbar />
        <Hero />
        <CategoryCards />
        <ShiftsCarousel />
        <HoursTable />
      </main>
      <RightRail />
    </div>
  );
}
