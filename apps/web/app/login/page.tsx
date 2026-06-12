import type { Metadata } from "next";
import { personas } from "@/lib/auth/mock-users";
import { LoginPersonas, type PersonaCard } from "./login-personas";

export const metadata: Metadata = {
  title: "Kora — Choose a session",
  description: "Mock sign-in for the Kora prototype.",
};

export default function LoginPage() {
  const cards: PersonaCard[] = personas.map(
    ({ id, name, roleLine, avatar }) => ({ id, name, roleLine, avatar }),
  );

  return (
    <main className="flex min-h-dvh flex-col bg-canvas text-ink lg:flex-row">
      <section className="flex items-end bg-panel px-8 pb-8 pt-10 lg:w-[40%] lg:px-12 lg:pb-14">
        <div>
          <p className="font-display text-[34px] font-semibold italic tracking-tight text-cream">
            Kora<span className="not-italic text-ember">.</span>
          </p>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-cream/70">
            Community service, recorded like it matters.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 pb-16 pt-10">
        <div className="w-full max-w-[480px]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/80">
            Mock session — replaced by Clerk in production
          </p>
          <h1 className="mt-2 font-display text-[32px] font-semibold tracking-tight [text-wrap:balance]">
            Choose a session
          </h1>
          <LoginPersonas personas={cards} />
        </div>
      </section>
    </main>
  );
}
