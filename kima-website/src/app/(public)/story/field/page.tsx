import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: '사역현장 이야기 | KIMA' }

export default async function FieldStoryPage() {
  const session = await auth()

  const stories = await prisma.story.findMany({
    where: { type: 'FIELD_STORY', isPublished: true, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Field Story</p>
            <h1 className="text-2xl font-bold">사역현장 이야기</h1>
            <p className="mt-2 text-blue-200 text-sm">회원들이 직접 나누는 현장 사역 이야기입니다.</p>
          </div>
          {session && (
            <Link
              href="/story/field/write"
              className="shrink-0 px-4 py-2 bg-[#C8922A] text-white text-sm font-semibold rounded-lg hover:bg-[#b07d22] transition-colors"
            >
              이야기 올리기
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {stories.length === 0 ? (
          <p className="text-center text-gray-400 py-20">등록된 이야기가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <Link key={story.id} href={`/story/${story.id}`}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow h-full">
                  {story.thumbnail && (
                    <img
                      src={story.thumbnail}
                      alt={story.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {story.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{story.title}</h3>
                  {story.excerpt && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-3">{story.excerpt}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <span>{story.authorName ?? '익명'}</span>
                    {story.ministryLocation && <span>· {story.ministryLocation}</span>}
                    <span className="ml-auto">{story.createdAt.toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
