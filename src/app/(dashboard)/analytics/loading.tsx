export default function AnalyticsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      {/* Stat chips skeleton */}
      <div className="flex flex-wrap gap-2">
        {[120, 90, 105, 80].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="kpi-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="skeleton h-3 rounded w-24" />
              <div className="skeleton ios-icon" />
            </div>
            <div className="skeleton h-8 rounded w-20" />
            <div className="skeleton h-3 rounded w-16" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4">
        <div className="xl:col-span-2 chart-card p-5 h-72">
          <div className="skeleton h-4 rounded w-40 mb-2" />
          <div className="skeleton h-3 rounded w-28 mb-6" />
          <div className="skeleton h-44 rounded-xl" />
        </div>
        <div className="chart-card p-5 h-72">
          <div className="skeleton h-4 rounded w-28 mb-2" />
          <div className="skeleton h-3 rounded w-20 mb-6" />
          <div className="skeleton h-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
