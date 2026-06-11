import Link from "next/link";

export function AdminForbidden() {
  return (
    <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-surface)] p-8">
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">
        Admin access required
      </h2>
      <p className="mt-2 text-[var(--color-muted)]">
        Your account is signed in but does not have the{" "}
        <code className="rounded bg-black/5 px-1">SCHOOL_ADMIN</code> role. Set{" "}
        <code className="rounded bg-black/5 px-1">SEED_ADMIN_EMAIL</code> in{" "}
        <code className="rounded bg-black/5 px-1">.env.local</code> to your Clerk
        email, then sign in again.
      </p>
      <Link
        href="/sign-in"
        className="mt-4 inline-block text-sm font-medium text-[var(--color-primary-deep)]"
      >
        Sign in with a different account
      </Link>
    </div>
  );
}
