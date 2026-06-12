"use client";

import { createContext, useContext, useMemo } from "react";
import type { ModeratorSession } from "@/lib/auth/session";
import type { ModeratorProfile } from "@/lib/types/moderator";

interface ModeratorSessionValue {
  session: ModeratorSession;
  persona: ModeratorProfile;
}

const ModeratorSessionContext = createContext<ModeratorSessionValue | null>(
  null,
);

export function ModeratorSessionProvider({
  session,
  persona,
  children,
}: ModeratorSessionValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ session, persona }), [session, persona]);
  return (
    <ModeratorSessionContext.Provider value={value}>
      {children}
    </ModeratorSessionContext.Provider>
  );
}

export function useModeratorSession(): ModeratorSessionValue {
  const ctx = useContext(ModeratorSessionContext);
  if (!ctx) {
    throw new Error(
      "useModeratorSession must be used inside ModeratorSessionProvider",
    );
  }
  return ctx;
}
