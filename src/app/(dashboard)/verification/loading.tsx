export default function VerificationLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {[100, 80, 110, 90].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle bg-card">
          {[40, 160, 120, 100, 80, 100].map((w, i) => (
            <div key={i} className="skeleton h-3 rounded" style={{ width: w }} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-border-subtle/50 last:border-0"
          >
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-7 w-7 rounded-full" />
            <div className="skeleton h-3 rounded" style={{ width: 130 + (i % 3) * 20 }} />
            <div className="skeleton h-3 rounded w-24" />
            <div className="skeleton h-5 rounded-full w-18" />
            <div className="skeleton h-6 rounded w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
