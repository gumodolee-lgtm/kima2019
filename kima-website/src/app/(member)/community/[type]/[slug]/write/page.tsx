import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WritePostForm } from '@/components/community/WritePostForm'
import type { Metadata } from 'next'
import type { CategoryType } from '@prisma/client'

export const dynamic = 'force-dynamic'

const URL_TO_DB: Record<string, CategoryType> = {
  region: 'REGION',
  language: 'LANGUAGE',
  target: 'TARGET',
}

interface Props {
  params: Promise<{ type: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return { title: '글쓰기 | KIMA' }
  return { title: `${category.name} 글쓰기 | KIMA` }
}

export default async function WritePostPage({ params }: Props) {
  const { type, slug } = await params
  const dbType = URL_TO_DB[type]
  if (!dbType) notFound()

  const [session, category] = await Promise.all([
    auth(),
    prisma.category.findUnique({ where: { slug } }),
  ])

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/community/${type}/${slug}/write`)
  }

  const role = session.user.role
  const ROLE_WEIGHT: Record<string, number> = { MEMBER: 1, PREMIUM: 2, OFFICER: 3, ADMIN: 4 }
  const roleWeight = ROLE_WEIGHT[role] ?? 0
  if (roleWeight < 2) {
    redirect(`/community/${type}/${slug}`)
  }
  const canWriteNotice = roleWeight >= 3

  if (!category || category.type !== dbType) notFound()

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href={`/community/${type}/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {category.name} 게시판으로
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">게시글 작성</h1>
          <p className="mt-1 text-sm text-gray-500">{category.name} 카테고리에 게시글을 등록합니다.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <WritePostForm
            categoryId={category.id}
            categoryName={category.name}
            categoryType={type}
            categorySlug={slug}
            canWriteNotice={canWriteNotice}
          />
        </div>
      </div>
    </div>
  )
}
