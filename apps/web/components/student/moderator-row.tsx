import { BadgeCheck } from "lucide-react";
import type { OrgModerator } from "@/lib/types/student";

interface ModeratorRowProps {
  moderator: OrgModerator;
  compact?: boolean;
}

export function ModeratorRow({ moderator, compact = false }: ModeratorRowProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl bg-accent-lavender/40 ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={moderator.avatar}
        alt=""
        className={`shrink-0 rounded-full bg-white object-cover ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold text-ink ${
            compact ? "text-[12px]" : "text-[13px]"
          }`}
        >
          {moderator.name}
        </p>
        <p
          className={`truncate text-muted ${
            compact ? "text-[11px]" : "text-[12px]"
          }`}
        >
          {moderator.roleTitle}
        </p>
        <p
          className={`flex items-center gap-1 text-muted ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          <BadgeCheck size={compact ? 11 : 12} className="shrink-0 text-primary" />
          {moderator.totalVerifications.toLocaleString()} verifications
        </p>
      </div>
    </div>
  );
}
