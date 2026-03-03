import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 rounded w-40" />
          <Skeleton className="h-4 rounded w-28" />
        </div>
      </div>
      <Skeleton className="h-48 rounded-xl w-full" />
      <Skeleton className="h-32 rounded-xl w-full" />
    </div>
  );
}
