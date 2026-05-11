import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VideoEmbed } from '@/components/story/VideoEmbed'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const story = await prisma.story.findUnique({ where: { id }, select: { title: true } })
  return { title: story ? `${story.title} | KIMA 현장스토리` : '현장스토리 | KIMA' }
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { id } = await params

  const story = await prisma.story.findUnique({
    where: { id, isPublished: true },
    include: { author: { select: { name: true, organization: true } } },
  })

  if (!story) notFound()

  const date = story.createdAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={`/story${story.type === 'VIDEO' ? '?type=VIDEO' : ''}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
        >
          ← 목록으로
        </Link>

        <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 영상 임베드 */}
          {story.type === 'VIDEO' && story.videoUrl && (
            <div className="p-5 pb-0">
              <VideoEmbed url={story.videoUrl} title={story.title} />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* 유형 뱃지 + 날짜 */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                story.type === 'VIDEO'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {story.type === 'VIDEO' ? '▶ 영상자료' : '📝 일반자료'}
              </span>
              <span className="text-xs text-gray-400">{date}</span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6">{story.title}</h1>

            {/* 작성자 */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white font-bold shrink-0">
                {(story.author.name ?? 'K')[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{story.author.name ?? 'KIMA'}</p>
                {story.author.organization && (
                  <p className="text-xs text-gray-400">{story.author.organization}</p>
                )}
              </div>
            </div>

            {/* 본문 */}
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {story.content}
            </div>
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link
            href={`/story${story.type === 'VIDEO' ? '?type=VIDEO' : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-all text-sm"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
