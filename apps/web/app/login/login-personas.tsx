"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { login, type LoginState } from "./actions";

export interface PersonaCard {
  id: string;
  name: string;
  roleLine: string;
  avatar: string;
}

function PersonaRow({ persona, index }: { persona: PersonaCard; index: number }) {
  const { pending, data } = useFormStatus();
  const isSubmitting = pending && data?.get("persona") === persona.id;

  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        type="submit"
        name="persona"
        value={persona.id}
        disabled={pending}
        className="group flex w-full items-center gap-4 rounded-card bg-surface px-5 py-4 text-left shadow-card transition-[transform,box-shadow] duration-150 ease-soft hover:-translate-y-px hover:shadow-raised active:scale-[0.98] disabled:cursor-default motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      >
        <span
          className={`flex min-w-0 flex-1 items-center gap-4 transition-[opacity,filter] duration-150 ease-soft ${
            isSubmitting ? "opacity-70 blur-[2px]" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={persona.avatar}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl bg-accent-sky object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold leading-tight">
              {persona.name}
            </span>
            <span className="block truncate font-mono text-[11px] text-muted">
              {persona.roleLine}
            </span>
          </span>
        </span>
        {isSubmitting ? (
          <Loader2
            size={18}
            strokeWidth={2.2}
            className="shrink-0 animate-spin text-muted"
            aria-hidden
          />
        ) : (
          <ChevronRight
            size={18}
            strokeWidth={2.2}
            className="shrink-0 text-muted transition group-hover:text-primary"
            aria-hidden
          />
        )}
        <span className="sr-only">Log in as {persona.name}</span>
      </button>
    </li>
  );
}

export function LoginPersonas({ personas }: { personas: PersonaCard[] }) {
  const [state, formAction] = useActionState<LoginState | null, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="mt-8">
      <ul className="flex flex-col gap-3">
        {personas.map((persona, index) => (
          <PersonaRow key={persona.id} persona={persona} index={index} />
        ))}
      </ul>
      {state?.error ? (
        <p className="mt-4 text-[13px] font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
