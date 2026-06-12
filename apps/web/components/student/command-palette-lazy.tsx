"use client";

import dynamic from "next/dynamic";

export const CommandPaletteLazy = dynamic(
  () =>
    import("@/components/student/command-palette").then((mod) => ({
      default: mod.CommandPalette,
    })),
  { ssr: false },
);
