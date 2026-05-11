export default function AdminLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse" />
    </div>
  )
}
