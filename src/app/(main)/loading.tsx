export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-52 md:h-64 rounded-2xl bg-gray-200" />

      {/* City filter skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-gray-200 flex-shrink-0"
          />
        ))}
      </div>

      {/* Activity cards skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border p-5 space-y-3">
            <div className="h-5 w-20 rounded-full bg-gray-200" />
            <div className="h-6 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-10 w-full rounded-xl bg-gray-200 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}