export default function FollowUpsLoading() {
  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      <div className="skeleton h-7 rounded w-36" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
