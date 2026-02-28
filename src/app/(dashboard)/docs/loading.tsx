export default function DocsLoading() {
  return (
    <div className="animate-fade-in">
      {/* Chapter tab bar */}
      <div className="flex gap-2 border-b border-border-subtle pb-3 mb-6 overflow-hidden">
        {[80, 100, 90, 110, 85, 95, 70, 100].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-full flex-shrink-0" style={{ width: w }} />
        ))}
      </div>
      {/* Hero */}
      <div className="skeleton h-36 rounded-2xl mb-6" />
      {/* Content blocks */}
      <div className="space-y-4 max-w-3xl">
        <div className="skeleton h-5 rounded w-48" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-5/6" />
        <div className="skeleton h-3 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="mt-6 skeleton h-5 rounded w-40" />
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-5/6" />
      </div>
    </div>
  );
}
