"use client";

import { notFound } from "next/navigation";
import { HourLogDetail } from "@/components/student/hour-log-detail";
import { useHours } from "@/components/student/hours-provider";

export function HourLogDetailPageClient({ logId }: { logId: string }) {
  const { logs } = useHours();
  const log = logs.find((item) => item.id === logId);

  if (!log) {
    notFound();
  }

  return <HourLogDetail log={log} />;
}
