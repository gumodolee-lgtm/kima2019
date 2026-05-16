import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/community/PostCard'
import { ResourceUploadForm } from '@/components/community/ResourceUploadForm'
import type { Metadata } from 'next'
import type { CategoryType, AccessLevel } from '@prisma/client'

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
  if (!category) return { title: '카테고리를 찾을 수 없습니다 | KIMA' }
  return { title: `${category.name} | KIMA 커뮤니티` }
}

function AccessBadge({ level }: { level: AccessLevel }) {
  if (level === 'PUBLIC') return null
  if (level === 'MEMBER') return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">회원</span>
  )
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">정회원</span>
  )
}

export default async function CategoryBoardPage({ params }: Props) {
  const { type, slug } = await params
  const dbType = URL_TO_DB[type]
  if (!dbType) notFound()

  const [category, session] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { isPublished: true },
          include: { author: { select: { id: true, name: true } }, category: { select: { id: true, name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    auth(),
  ])

  if (!category || category.type !== dbType) notFound()

  const userRole = session?.user?.role
  const ROLE_WEIGHT = { MEMBER: 1, PREMIUM: 2, OFFICER: 3, ADMIN: 4 } as const
  const roleWeight = userRole ? (ROLE_WEIGHT[userRole] ?? 1) : 0
  const canWrite = roleWeight >= 2
  const isPremium = roleWeight >= 2

  const notices = category.posts.filter((p) => p.type === 'NOTICE')
  const shares = category.posts.filter((p) => p.type === 'SHARE')

  const accessibleResources = category.resources.filter((r) => {
    if (r.accessLevel === 'PUBLIC') return true
    if (r.accessLevel === 'MEMBER') return roleWeight >= 1
    return isPremium
  })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 뒤로가기 */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          커뮤니티 목록
        </Link>

        {/* 카테고리 헤더 + 담당 위원장 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1B3A6B]">{category.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {dbType === 'REGION' && '지역별 카테고리'}
                {dbType === 'LANGUAGE' && '언어권별 카테고리'}
                {dbType === 'TARGET' && '사역대상별 카테고리'}
              </p>
            </div>

            {/* 담당 위원장 */}
            {category.officerName && (
              <div className="flex items-center gap-4 bg-[#F8F9FA] rounded-xl p-4">
                {category.officerQr && (
                  <Image
                    src={category.officerQr}
                    alt="QR코드"
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">담당 위원장</p>
                  <p className="text-sm font-bold text-[#1B3A6B]">{category.officerName}</p>
                  {category.officerSns && (
                    <p className="text-xs text-gray-500 mt-0.5">SNS: {category.officerSns}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    보안 문의는 담당 위원장에게 직접 연락해 주세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 공지 + 사역나눔 게시판 (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* 공지사항 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#1B3A6B] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B3A6B] inline-block" />
                  공지사항
                </h2>
                {canWrite && (
                  <Link
                    href={`/community/${type}/${slug}/write`}
                    className="text-xs text-[#1B3A6B] font-medium hover:underline"
                  >
                    + 글쓰기
                  </Link>
                )}
              </div>
              {notices.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">등록된 공지사항이 없습니다.</p>
              ) : (
                <div>
                  {notices.map((post) => (
                    <PostCard key={post.id} post={post} categoryType={type} />
                  ))}
                </div>
              )}
            </div>

            {/* 사역 나눔 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#1B3A6B] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C8922A] inline-block" />
                  사역 나눔
                </h2>
                {canWrite && (
                  <Link
                    href={`/community/${type}/${slug}/write`}
                    className="text-xs text-[#1B3A6B] font-medium hover:underline"
                  >
                    + 글쓰기
                  </Link>
                )}
              </div>
              {shares.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">등록된 사역 나눔이 없습니다.</p>
              ) : (
                <div>
                  {shares.map((post) => (
                    <PostCard key={post.id} post={post} categoryType={type} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 자료 목록 (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#1B3A6B] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                  사역자료
                </h2>
                {isPremium && (
                  <ResourceUploadForm
                    categoryId={category.id}
                    categoryName={category.name}
                  />
                )}
              </div>

              {category.resources.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">등록된 자료가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {category.resources.map((resource) => {
                    const canAccess =
                      resource.accessLevel === 'PUBLIC' ||
                      (resource.accessLevel === 'MEMBER' && roleWeight >= 1) ||
                      (resource.accessLevel === 'PREMIUM' && isPremium)

                    return (
                      <div key={resource.id} className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-medium text-gray-700 truncate">{resource.title}</span>
                            <AccessBadge level={resource.accessLevel} />
                          </div>
                          {resource.fileType && (
                            <span className="text-xs text-gray-400">{resource.fileType}</span>
                          )}
                        </div>
                        {canAccess ? (
                          <a
                            href={resource.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs text-[#1B3A6B] font-medium hover:underline"
                          >
                            열기
                          </a>
                        ) : (
                          <Link
                            href={resource.accessLevel === 'PREMIUM' ? '/member/upgrade' : '/auth/login'}
                            className="shrink-0 text-xs text-gray-400"
                          >
                            🔒
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {!isPremium && category.resources.some((r) => r.accessLevel === 'PREMIUM') && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-2">정회원 전용 자료가 있습니다</p>
                  <Link
                    href="/member/upgrade"
                    className="text-xs text-[#C8922A] font-medium hover:underline"
                  >
                    정회원 신청하기 →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
