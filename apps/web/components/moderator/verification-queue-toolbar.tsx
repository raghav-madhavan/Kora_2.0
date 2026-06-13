"use client";

import {
  ArrowDownUp,
  Check,
  RefreshCw,
  Rows2,
  Rows3,
  X,
} from "lucide-react";
import type { OrgLogSort } from "@/lib/verifications";

export type QueueDensity = "comfortable" | "compact";

interface VerificationQueueToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onApproveSelected: () => void;
  onRejectSelected: () => void;
  sort: OrgLogSort;
  onSortChange: (sort: OrgLogSort) => void;
  density: QueueDensity;
  onDensityToggle: () => void;
  onRefresh: () => void;
  busy: boolean;
}

const SORT_LABELS: Record<OrgLogSort, string> = {
  oldest: "Oldest first",
  newest: "Newest first",
  "hours-desc": "Most hours",
};

export function VerificationQueueToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleAll,
  onClearSelection,
  onApproveSelected,
  onRejectSelected,
  sort,
  onSortChange,
  density,
  onDensityToggle,
  onRefresh,
  busy,
}: VerificationQueueToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-card bg-surface/95 px-4 py-3 shadow-card backdrop-blur">
      <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold">
        <input
          type="checkbox"
          checked={allSelected && totalCount > 0}
          onChange={onToggleAll}
          aria-label="Select all claims in view"
          className="h-[18px] w-[18px] accent-primary"
          disabled={totalCount === 0}
        />
        {hasSelection ? (
          <span className="tabular-nums">{selectedCount} selected</span>
        ) : (
          <span className="text-muted">
            <span className="tabular-nums text-ink">{totalCount}</span> in queue
          </span>
        )}
      </label>

      {hasSelection ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApproveSelected}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-deep active:scale-[0.97] disabled:opacity-60"
          >
            <Check size={14} strokeWidth={2.6} />
            Approve selected
          </button>
          <button
            type="button"
            onClick={onRejectSelected}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[13px] font-semibold text-danger transition hover:bg-danger/10 active:scale-[0.97] disabled:opacity-60"
          >
            <X size={14} strokeWidth={2.6} />
            Reject selected
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={busy}
            className="rounded-pill px-2.5 py-2 text-[13px] font-semibold text-muted transition hover:text-ink"
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <label className="relative">
          <span className="sr-only">Sort claims</span>
          <ArrowDownUp
            size={15}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as OrgLogSort)}
            className="cursor-pointer rounded-pill bg-canvas py-2 pl-9 pr-3 text-[13px] font-semibold outline-none ring-primary/40 focus:ring-2"
          >
            {(Object.keys(SORT_LABELS) as OrgLogSort[]).map((value) => (
              <option key={value} value={value}>
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onDensityToggle}
          aria-pressed={density === "compact"}
          aria-label={
            density === "compact"
              ? "Switch to comfortable rows"
              : "Switch to compact rows"
          }
          title={density === "compact" ? "Comfortable rows" : "Compact rows"}
          className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink active:scale-[0.97]"
        >
          {density === "compact" ? (
            <Rows3 size={17} strokeWidth={2.2} />
          ) : (
            <Rows2 size={17} strokeWidth={2.2} />
          )}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh queue"
          title="Refresh queue"
          className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted transition hover:text-ink active:scale-[0.97]"
        >
          <RefreshCw size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
