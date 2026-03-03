import { Skeleton } from "@/components/ui/skeleton";

export default function VerificationLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {[100, 80, 110, 90].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      {/* Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle bg-card">
          {[40, 160, 120, 100, 80, 100].map((w, i) => (
            <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-border-subtle/50 last:border-0"
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 rounded" style={{ width: 130 + (i % 3) * 20 }} />
            <Skeleton className="h-3 rounded w-24" />
            <Skeleton className="h-5 rounded-full w-18" />
            <Skeleton className="h-6 rounded w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
