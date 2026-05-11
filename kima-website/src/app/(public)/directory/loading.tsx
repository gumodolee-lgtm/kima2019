export default function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 스켈레톤 */}
        <div className="h-14 bg-white rounded-xl border border-gray-100 animate-pulse mb-6" />
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 지도 스켈레톤 */}
          <div className="lg:w-1/2 h-[500px] bg-gray-100 rounded-xl animate-pulse" />
          {/* 카드 목록 스켈레톤 */}
          <div className="lg:w-1/2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
