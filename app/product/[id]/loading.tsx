export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 w-40 bg-gray-100 rounded mb-5" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image skeleton */}
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
          <div className="h-8 w-3/4 bg-gray-100 rounded" />
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="h-10 w-48 bg-gray-100 rounded" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full" />
            ))}
          </div>
          <div className="h-40 bg-gray-50 rounded-2xl mt-6" />
        </div>
      </div>
    </div>
  );
}
