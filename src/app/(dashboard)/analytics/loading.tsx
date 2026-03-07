import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      {/* Stat chips skeleton */}
      <div className="flex flex-wrap gap-2">
        {[120, 90, 105, 80].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-2xl" />
        ))}
      </div>

      {/* Row 1: Trend chart + Conversion Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Skeleton className="xl:col-span-3 h-[300px] rounded-xl" />
        <Skeleton className="xl:col-span-2 h-[300px] rounded-xl" />
      </div>

      {/* Row 2: Lead Sources + Velocity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Skeleton className="h-[250px] rounded-xl" />
        <Skeleton className="h-[250px] rounded-xl" />
      </div>
    </div>
  );
}
