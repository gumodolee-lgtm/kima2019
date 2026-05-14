import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '행사 사진&영상 | KIMA' }

export default async function MediaPage() {
  const events = await prisma.story.findMany({
    where: { type: 'EVENT_MEDIA', isPublished: true, status: 'APPROVED' },
    orderBy: { publishedAt: 'desc' },
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Gallery</p>
          <h1 className="text-2xl font-bold">KIMA 행사 사진&영상</h1>
          <p className="mt-2 text-blue-200 text-sm">KIMA가 주관·참여한 행사들의 사진과 영상을 모아봅니다.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {events.length === 0 ? (
          <p className="text-center text-gray-400 py-20">등록된 갤러리가 없습니다.</p>
        ) : (
          <div className="space-y-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  {event.publishedAt && (
                    <span className="text-xs text-gray-400">
                      {event.publishedAt.toLocaleDateString('ko-KR')}
                    </span>
                  )}
                  {event.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                {event.excerpt && (
                  <p className="text-sm text-gray-500 mb-4">{event.excerpt}</p>
                )}

                {/* 사진 그리드 */}
                {event.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {event.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${event.title} ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* 영상 링크 */}
                {event.videoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.videoUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        ▶ 영상 보기 {event.videoUrls.length > 1 ? i + 1 : ''}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
