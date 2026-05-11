export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 탭 스켈레톤 */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-28 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
        {/* 카테고리 카드 스켈레톤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
