"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Download, X } from "lucide-react";
import {
  getBrightFuturesTiers,
  getCategoryGoals,
  getGraduationRequirement,
  getVerifiedHours,
  getVerifiedHoursByCategory,
} from "@/lib/compliance";
import { student } from "@/lib/mock-data";
import type { CategoryKey, ShiftLog } from "@/lib/types/student";

const categoryLabels: Record<CategoryKey, string> = {
  community: "Community",
  environment: "Environment",
  education: "Education",
};

interface TranscriptExportModalProps {
  open: boolean;
  logs: ShiftLog[];
  onClose: () => void;
}

export function TranscriptExportModal({
  open,
  logs,
  onClose,
}: TranscriptExportModalProps) {
  const [includePending, setIncludePending] = useState(false);
  const [exported, setExported] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setExported(false);
      setIncludePending(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const exportLogs = logs.filter((log) =>
    includePending ? true : log.status === "verified",
  );
  const verifiedHours = getVerifiedHours(logs);
  const verifiedByCategory = getVerifiedHoursByCategory(logs);
  const categoryGoals = getCategoryGoals(student.schoolState);
  const graduationRequired = getGraduationRequirement(student.schoolState);
  const brightFutures = getBrightFuturesTiers(student.schoolState);
  const gradeParts = student.grade.split(" · ");
  const school = gradeParts[1] ?? "Lincoln High";

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) {
      return;
    }
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kora Service Transcript — ${student.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 32px; color: #2d2d2d; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .muted { color: #757575; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e8e6e0; font-size: 13px; }
            th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #757575; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setExported(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transcript-export-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface p-6 shadow-raised sm:translate-y-0"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="transcript-export-title" className="text-[20px] font-bold">
              Export transcript
            </h2>
            <p className="mt-1 text-[14px] text-muted">
              Printable summary for counselors and scholarship applications
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {exported ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-sky">
              <BadgeCheck size={28} className="text-success" strokeWidth={2.4} />
            </div>
            <h3 className="text-[18px] font-bold">Transcript ready</h3>
            <p className="mt-2 text-[14px] text-muted">
              Use your browser print dialog to save as PDF.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-pill bg-primary px-6 py-2.5 text-[14px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div ref={printRef} className="rounded-xl bg-canvas p-4">
              <h3 className="text-[18px] font-bold">{student.name}</h3>
              <p className="muted text-[13px]">
                {student.grade} · {school}
              </p>
              <p className="mt-4 text-[14px]">
                <strong>{verifiedHours}</strong> verified service hours
                {brightFutures
                  ? ` · Graduation: ${verifiedHours}/${graduationRequired}`
                  : ` · Graduation: ${verifiedHours}/${graduationRequired}`}
              </p>
              <ul className="mt-3 space-y-1 text-[13px]">
                {(Object.keys(categoryGoals) as CategoryKey[]).map((key) => (
                  <li key={key}>
                    {categoryLabels[key]}: {verifiedByCategory[key]}/
                    {categoryGoals[key]} hrs
                  </li>
                ))}
              </ul>
              {exportLogs.length > 0 ? (
                <table className="mt-4 w-full text-left text-[12px]">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Organization</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.date}</td>
                        <td>{log.org}</td>
                        <td>{log.hours}</td>
                        <td>{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px]">
              <input
                type="checkbox"
                checked={includePending}
                onChange={(e) => setIncludePending(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 accent-primary"
              />
              Include pending hours (not counted toward goals)
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-primary px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-primary-deep"
              >
                <Download size={16} />
                Download / Print PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-pill bg-accent-lavender px-5 py-3 text-[14px] font-semibold text-primary"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
