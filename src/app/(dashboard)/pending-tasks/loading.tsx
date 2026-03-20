export default function PendingTasksLoading() {
  return (
    <div className="space-y-5" data-testid="pending-tasks-loading">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg bg-elevated animate-pulse" />
          <div className="h-3.5 w-64 rounded bg-elevated animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 rounded-xl bg-elevated animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-elevated animate-pulse" />
        </div>
      </div>
      {/* Two-panel skeleton */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left panel */}
        <div className="rounded-xl border border-border-subtle bg-card">
          <div className="border-b border-border-subtle px-5 py-3.5">
            <div className="h-4 w-20 rounded bg-elevated animate-pulse" />
          </div>
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-border-subtle p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-elevated" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-elevated" />
                    <div className="h-2.5 w-44 rounded bg-elevated" />
                  </div>
                  <div className="h-5 w-20 rounded-full bg-elevated" />
                </div>
                <div className="h-16 rounded-lg bg-elevated/60" />
              </div>
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div className="rounded-xl border border-border-subtle bg-card">
          <div className="border-b border-border-subtle px-5 py-3.5">
            <div className="h-4 w-32 rounded bg-elevated animate-pulse" />
          </div>
          <div className="space-y-4 p-5 animate-pulse">
            <div className="flex justify-start">
              <div className="h-12 w-3/5 rounded-2xl bg-elevated" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-2/5 rounded-2xl bg-elevated" />
            </div>
            <div className="flex justify-start">
              <div className="h-14 w-3/4 rounded-2xl bg-elevated" />
            </div>
          </div>
          <div className="border-t border-border-subtle p-4">
            <div className="h-24 rounded-xl bg-elevated animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
