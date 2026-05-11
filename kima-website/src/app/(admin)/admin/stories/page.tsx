import { prisma } from '@/lib/prisma'
import { StoryForm } from '@/components/admin/StoryForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '현장스토리 관리 | KIMA 관리자' }

export default async function AdminStoriesPage() {
  const stories = await prisma.story.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1B3A6B]">현장스토리 관리</h1>
        <p className="text-sm text-gray-500 mt-1">일반자료와 영상자료를 등록·관리합니다.</p>
      </div>

      <StoryForm />

      <div className="space-y-3">
        {stories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            등록된 스토리가 없습니다.
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      story.type === 'VIDEO'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {story.type === 'VIDEO' ? '▶ 영상자료' : '📝 일반자료'}
                    </span>
                    {!story.isPublished && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">비공개</span>
                    )}
                    <span className="font-semibold text-gray-900 text-sm">{story.title}</span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                    {story.content.slice(0, 100)}
                  </p>

                  {story.type === 'VIDEO' && story.videoUrl && (
                    <a
                      href={story.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline truncate block"
                    >
                      🎬 {story.videoUrl}
                    </a>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {story.author.name ?? 'KIMA'} ·{' '}
                    {story.createdAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <DeleteButton url={`/api/stories/${story.id}`} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
