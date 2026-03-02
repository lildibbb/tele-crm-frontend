export default function AuditLogsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 rounded w-40" />
        <div className="skeleton h-9 rounded-xl w-28" />
      </div>
      <div className="flex gap-2">
        {[80, 100, 90, 110, 95].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
