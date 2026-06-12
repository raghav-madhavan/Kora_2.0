"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/student/page-header";
import { GoalsOverview } from "@/components/student/goals-overview";
import { TranscriptExportModal } from "@/components/student/transcript-export-modal";
import { useHours } from "@/components/student/hours-provider";

export function GoalsPageClient() {
  const { logs } = useHours();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Goals"
        description="Progress toward graduation and scholarship requirements"
        action={
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
          >
            <Download size={16} strokeWidth={2.4} />
            Export transcript
          </button>
        }
      />
      <GoalsOverview logs={logs} />
      <TranscriptExportModal
        open={exportOpen}
        logs={logs}
        onClose={() => setExportOpen(false)}
      />
    </>
  );
}
