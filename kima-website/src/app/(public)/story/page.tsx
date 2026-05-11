import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사역 스토리 | KIMA',
  description: '전국 다문화사역 현장의 이야기를 만나보세요.',
}

export default async function StoryPage() {
  const posts = await prisma.post.findMany({
    where: { type: 'SHARE', isPublished: true },
    include: {
      author: { select: { name: true, organization: true } },
      category: { select: { name: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Story</p>
          <h1 className="text-3xl font-bold">사역 나눔 스토리</h1>
          <p className="mt-3 text-blue-200">전국 다문화사역 현장의 생생한 이야기를 나눕니다</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-lg">아직 등록된 스토리가 없습니다.</p>
            <p className="text-sm mt-2">임원·위원장이 사역 나눔을 작성하면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/story/${post.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col group"
              >
                <div className="flex items-center gap-2 mb-3">
                  {post.category && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {post.category.name}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {post.createdAt.toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <h2 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-[#1B3A6B] transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-3 flex-1">
                  {post.content.replace(/[#*_\[\]]/g, '').slice(0, 150)}
                </p>
                <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-50">
                  <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(post.author.name ?? 'A')[0]}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span>{post.author.name ?? '익명'}</span>
                    {post.author.organization && (
                      <span className="ml-1">· {post.author.organization}</span>
                    )}
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
