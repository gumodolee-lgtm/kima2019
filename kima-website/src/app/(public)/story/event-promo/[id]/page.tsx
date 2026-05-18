import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { VideoEmbed } from '@/components/story/VideoEmbed'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const story = await prisma.story.findUnique({ where: { id }, select: { title: true } }).catch(() => null)
  return { title: story ? `${story.title} | KIMA 행사 홍보` : '행사 홍보 | KIMA' }
}

export default async function EventPromoDetailPage({ params }: Props) {
  const { id } = await params
  const story = await prisma.story.findUnique({
    where: { id, type: 'EVENT_PROMO', isPublished: true, status: 'APPROVED' },
    include: { author: { select: { name: true } } },
  }).catch(() => null)

  if (!story) notFound()

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 헤더 */}
      <div className="bg-[#1B3A6B] text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/story/event-promo"
            className="inline-flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white transition-colors"
          >
            ← 목록으로
          </Link>
          {story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {story.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-rose-500/30 text-rose-200 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold leading-snug">{story.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-200">
            {story.eventLocation && (
              <span>📍 {story.eventLocation}</span>
            )}
            <span>{story.authorName ?? story.author?.name ?? '작성자'}</span>
            <span>{story.createdAt.toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* 대표 이미지 */}
        {story.thumbnail && (
          <img
            src={story.thumbnail}
            alt={story.title}
            className="w-full rounded-xl object-cover max-h-80"
          />
        )}

        {/* 본문 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {story.content}
          </div>
        </div>

        {/* 이미지 갤러리 */}
        {story.images.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">행사 사진</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {story.images.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                  <img
                    src={src}
                    alt={`행사 사진 ${i + 1}`}
                    className="w-full h-36 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 동영상 */}
        {story.videoUrls.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">관련 영상</h2>
            <div className="space-y-4">
              {story.videoUrls.map((url, i) => (
                <VideoEmbed key={i} url={url} title={`${story.title} 영상 ${i + 1}`} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* 목록 버튼 */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            href="/story/event-promo"
            className="inline-flex items-center gap-1 text-sm text-[#1B3A6B] font-medium hover:underline"
          >
            ← 행사 홍보 목록
          </Link>
        </div>
      </div>
    </div>
  )
}
