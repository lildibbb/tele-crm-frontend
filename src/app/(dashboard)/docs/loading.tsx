import { Skeleton } from "@/components/ui/skeleton";

export default function DocsLoading() {
  return (
    <div className="-m-4 md:-m-5 flex h-[calc(100dvh-3.5rem)] overflow-hidden animate-fade-in">
      {/* Left nav skeleton */}
      <div className="hidden lg:flex flex-col w-[220px] xl:w-[248px] shrink-0 border-r border-border-subtle bg-base/80 h-full overflow-hidden">
        <div className="px-4 pt-5 pb-3.5 border-b border-border-subtle space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-2 rounded w-24" />
              <Skeleton className="h-3.5 rounded w-28" />
            </div>
          </div>
          <Skeleton className="h-2.5 rounded w-32 mt-1" />
        </div>
        <div className="px-3 py-2.5 border-b border-border-subtle">
          <Skeleton className="h-8 rounded-lg w-full" />
        </div>
        <div className="flex-1 py-1.5 space-y-0.5 px-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-1.5 py-2">
              <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
              <Skeleton className="h-3 rounded" style={{ width: 80 + (i % 4) * 18 }} />
            </div>
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="h-12 border-b border-border-subtle flex items-center px-8 gap-3">
          <Skeleton className="h-3 rounded w-48" />
          <Skeleton className="h-3 rounded w-12 ml-auto" />
        </div>
        <div className="px-8 xl:px-16 py-8 max-w-[860px] space-y-5">
          <div className="flex items-start gap-4 mb-6">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 rounded w-24" />
              <Skeleton className="h-7 rounded w-64" />
              <Skeleton className="h-3.5 rounded w-full" />
              <Skeleton className="h-3.5 rounded w-4/5" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 rounded w-40" />
              <Skeleton className="h-3 rounded w-full" />
              <Skeleton className="h-3 rounded w-5/6" />
              <Skeleton className="h-3 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
