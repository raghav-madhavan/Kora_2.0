export default function ModeratorLoading() {
  return (
    <div className="flex min-w-0 flex-1">
      <main className="min-w-0 flex-1 px-4 pb-12 pt-7 sm:px-8">
        {/* Topbar skeleton */}
        <div className="mb-7 flex animate-pulse items-center gap-4">
          <div className="h-8 w-56 rounded-lg bg-surface shadow-card" />
          <div className="h-8 w-28 rounded-pill bg-surface shadow-card" />
          <div className="ml-auto h-11 w-11 rounded-full bg-surface shadow-card" />
        </div>

        {/* Page header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-72 max-w-full rounded-lg bg-surface/80" />
        </div>

        {/* Card placeholders */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <div className="h-28 animate-pulse rounded-card bg-surface shadow-card" />
            <div className="h-28 animate-pulse rounded-card bg-surface shadow-card" />
            <div className="h-28 animate-pulse rounded-card bg-surface shadow-card" />
            <div className="h-28 animate-pulse rounded-card bg-surface shadow-card" />
          </div>
          <div className="h-64 animate-pulse rounded-card bg-surface shadow-card" />
        </div>
      </main>
    </div>
  );
}
