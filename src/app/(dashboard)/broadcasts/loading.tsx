export default function BroadcastsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      <div className="skeleton h-7 rounded w-44" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}
