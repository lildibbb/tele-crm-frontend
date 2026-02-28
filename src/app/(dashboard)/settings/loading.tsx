export default function SettingsLoading() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-subtle pb-3">
        {[80, 110, 90, 100, 85, 95].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-lg" style={{ width: w }} />
        ))}
      </div>
      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border-subtle bg-card p-4 space-y-3">
              <div className="skeleton h-4 rounded w-36" />
              <div className="skeleton h-3 rounded w-full" />
              <div className="skeleton h-9 rounded-lg w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border-subtle bg-card p-4 space-y-3">
            <div className="skeleton h-4 rounded w-24" />
            <div className="skeleton h-3 rounded w-full" />
            <div className="skeleton h-3 rounded w-4/5" />
            <div className="skeleton h-8 rounded-lg w-full" />
          </div>
          <div className="rounded-xl border border-border-subtle bg-card p-4 space-y-3">
            <div className="skeleton h-4 rounded w-28" />
            <div className="skeleton h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
