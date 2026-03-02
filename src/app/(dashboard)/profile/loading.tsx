export default function ProfileLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="skeleton w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-5 rounded w-40" />
          <div className="skeleton h-4 rounded w-28" />
        </div>
      </div>
      <div className="skeleton h-48 rounded-xl w-full" />
      <div className="skeleton h-32 rounded-xl w-full" />
    </div>
  );
}
