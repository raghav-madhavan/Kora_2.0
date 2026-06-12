"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPersona } from "@/lib/auth/mock-users";
import { serializeSession, SESSION_COOKIE } from "@/lib/auth/session";

export interface LoginState {
  error: string;
}

/** Mock sign-in: validates persona, sets the session cookie, hands off to middleware. */
export async function login(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const personaId = formData.get("persona");
  const persona =
    typeof personaId === "string" ? getPersona(personaId) : undefined;

  if (!persona) {
    return { error: "Couldn't start the session. Try again." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, serializeSession(persona.session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  // Must match the path/options used at login or the browser keeps the cookie.
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/login");
}
