import { PageShell } from "@/components/student/page-shell";
import { LogHoursPageClient } from "@/components/student/log-hours-page-client";
import { getShiftQrSessions } from "@/lib/mock-store-server";

export default function LogHoursPage() {
  const demoToken = getShiftQrSessions().find(
    (s) => s.shiftId === "shift_food_bank",
  )?.token;

  return (
    <PageShell>
      <LogHoursPageClient demoToken={demoToken} />
    </PageShell>
  );
}
