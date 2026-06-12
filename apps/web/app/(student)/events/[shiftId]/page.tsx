import { notFound } from "next/navigation";
import { PageShell } from "@/components/student/page-shell";
import { ShiftDetailClient } from "@/components/student/shift-detail-client";
import { getShiftById } from "@/lib/shifts";

interface ShiftDetailPageProps {
  params: Promise<{ shiftId: string }>;
}

export default async function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { shiftId } = await params;
  const shift = getShiftById(shiftId);

  if (!shift) {
    notFound();
  }

  return (
    <PageShell>
      <ShiftDetailClient shift={shift} />
    </PageShell>
  );
}
