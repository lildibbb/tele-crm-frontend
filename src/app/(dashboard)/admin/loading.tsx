import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Admin nav tabs */}
      <div className="flex gap-1 border-b border-border-subtle pb-3">
        {[90, 80, 110, 100, 85, 90, 80].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-lg" style={{ width: w }} />
        ))}
      </div>
      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="kpi-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 rounded w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 rounded w-16" />
            <Skeleton className="h-3 rounded w-12" />
          </div>
        ))}
      </div>
      {/* Content panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div>
                <Skeleton className="h-4 rounded w-28 mb-1.5" />
                <Skeleton className="h-3 rounded w-40" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-9 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
