import { Skeleton } from "@/components/ui/skeleton";

export default function BroadcastsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      <Skeleton className="h-7 rounded w-44" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
