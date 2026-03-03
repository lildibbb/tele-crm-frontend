import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 rounded w-40" />
        <Skeleton className="h-9 rounded-xl w-28" />
      </div>
      <div className="flex gap-2">
        {[80, 100, 90, 110, 95].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
