"use client";

import dynamic from "next/dynamic";

export const CommandPaletteLazy = dynamic(
  () =>
    import("@/components/moderator/command-palette").then((mod) => ({
      default: mod.CommandPalette,
    })),
  { ssr: false },
);
