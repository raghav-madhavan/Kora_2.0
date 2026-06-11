import { AdminNav } from "@/components/admin-nav";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-[var(--color-surface)] px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Kora Admin
            </p>
            <h1 className="text-lg font-semibold text-[var(--color-ink)]">
              School Compliance Console
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <AdminNav />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
