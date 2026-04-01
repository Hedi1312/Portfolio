export default function AdminLoading() {
  return (
    <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
      <div className="mx-auto max-w-7xl w-full">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
        </div>

        {/* KPI Grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm"
            >
              <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse mb-3" />
              <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse mt-2" />
            </div>
          ))}
        </div>

        {/* Actions skeleton */}
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" />
                  <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
