import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'KIMA 뉴스 | KIMA' }

export default async function NewsPage() {
  const news = await prisma.story.findMany({
    where: { type: 'NEWS', isPublished: true, status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">News</p>
          <h1 className="text-2xl font-bold">KIMA 뉴스</h1>
          <p className="mt-2 text-blue-200 text-sm">KIMA 관련 외부 언론 기사·뉴스를 모아봅니다.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {news.length === 0 ? (
          <p className="text-center text-gray-400 py-20">등록된 뉴스가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.linkUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.source && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {item.source}
                        </span>
                      )}
                      {item.publishedAt && (
                        <span className="text-xs text-gray-400">
                          {item.publishedAt.toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#1B3A6B] transition-colors">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[#1B3A6B] text-sm font-medium">기사 보기 →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
