export default function DashboardLoading() {
  return (
    <div
      className="animate-pulse space-y-8"
      role="status"
      aria-label="Loading dashboard"
    >
      {/* Page heading */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded-lg bg-slate-200" />
        <div className="h-9 w-64 max-w-full rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-slate-100" />
      </div>

      {/* Statistics skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-4 w-28 rounded bg-slate-100" />
            <div className="mt-5 h-9 w-16 rounded bg-slate-200" />
            <div className="mt-4 h-3 w-36 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-6 w-40 rounded bg-slate-200" />

            <div className="mt-6 space-y-4">
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
              <div className="h-4 w-3/4 rounded bg-slate-100" />
            </div>

            <div className="mt-8 h-11 w-36 rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>

      <span className="sr-only">
        Please wait while the page loads.
      </span>
    </div>
  );
}