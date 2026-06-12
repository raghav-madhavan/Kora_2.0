import { NextResponse, type NextRequest } from "next/server";
import { resolveRedirect } from "@/lib/auth/policy";
import { parseSession, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Routing, not security: drops each session into its portal and bounces
 * obviously-wrong requests. Authorization lives in lib/auth/scope.ts at the
 * data layer. (Next 16 convention: proxy.ts, formerly middleware.ts.)
 */
export default function proxy(request: NextRequest) {
  const session = parseSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const destination = resolveRedirect(session, request.nextUrl.pathname);

  if (destination && destination !== request.nextUrl.pathname) {
    return NextResponse.redirect(new URL(destination, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, API routes, and static files.
  matcher: ["/((?!_next|api|favicon\\.ico|fonts|.*\\..*).*)"],
};
