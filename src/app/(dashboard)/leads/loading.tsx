export default function LeadsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      {/* Toolbar skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-9 w-64 rounded-lg" />
        <div className="skeleton h-9 w-24 rounded-lg" />
        <div className="skeleton h-9 w-24 rounded-lg" />
        <div className="ml-auto skeleton h-9 w-28 rounded-lg" />
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle bg-card">
          {[40, 180, 130, 100, 90, 80, 100].map((w, i) => (
            <div key={i} className="skeleton h-3 rounded" style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-border-subtle/50 last:border-0"
          >
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-7 w-7 rounded-full flex-shrink-0" />
            <div className="skeleton h-3 rounded" style={{ width: 140 + (i % 3) * 20 }} />
            <div className="skeleton h-3 rounded w-28" />
            <div className="skeleton h-5 rounded-full w-20" />
            <div className="skeleton h-3 rounded w-16" />
            <div className="skeleton h-3 rounded w-20" />
            <div className="skeleton h-6 rounded w-16 ml-auto" />
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 rounded w-36" />
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-8 w-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
