import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id }, select: { title: true } })
  return { title: post ? `${post.title} | KIMA 스토리` : '스토리 | KIMA' }
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id, type: 'SHARE', isPublished: true },
    include: {
      author: { select: { name: true, organization: true } },
      category: { select: { name: true } },
    },
  })

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 뒤로가기 */}
        <Link href="/story" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-8 transition-colors">
          ← 목록으로
        </Link>

        <article className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          {/* 메타 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {post.category.name}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {post.createdAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6">{post.title}</h1>

          {/* 작성자 */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white font-bold">
              {(post.author.name ?? 'A')[0]}
            </div>
            <div>
              <p className="font-medium text-gray-800">{post.author.name ?? '익명'}</p>
              {post.author.organization && (
                <p className="text-xs text-gray-400">{post.author.organization}</p>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link href="/story" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-all">
            ← 스토리 목록
          </Link>
        </div>
      </div>
    </div>
  )
}
