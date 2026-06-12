import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/student/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { HoursLedger } from "@/components/student/hours-ledger";

function HoursLedgerFallback() {
  return (
    <div className="h-64 animate-pulse rounded-card bg-surface shadow-card" />
  );
}

export default function HoursPage() {
  return (
    <PageShell>
      <PageHeader
        title="My Hours"
        description="Full service hour ledger"
        action={
          <Link
            href="/log-hours"
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
          >
            <Plus size={16} strokeWidth={2.4} />
            Log Hours
          </Link>
        }
      />
      <Suspense fallback={<HoursLedgerFallback />}>
        <HoursLedger />
      </Suspense>
    </PageShell>
  );
}
