import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { StoryCard } from '@/components/story/StoryCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '현장스토리 | KIMA',
  description: '이주민 사역 현장의 일반자료와 영상자료를 나눕니다.',
}

const TABS = [
  { key: 'ALL',   label: '전체' },
  { key: 'TEXT',  label: '일반자료' },
  { key: 'VIDEO', label: '영상자료' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function StoryPage({ searchParams }: PageProps) {
  const { type } = await searchParams
  const activeTab: TabKey = type === 'TEXT' ? 'TEXT' : type === 'VIDEO' ? 'VIDEO' : 'ALL'

  const [stories, groupCounts] = await Promise.all([
    prisma.story.findMany({
      where: {
        isPublished: true,
        ...(activeTab !== 'ALL' ? { type: activeTab } : {}),
      },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.story.groupBy({
      by: ['type'],
      where: { isPublished: true },
      _count: { _all: true },
    }),
  ])

  const textCount  = groupCounts.find((g) => g.type === 'TEXT')?._count._all  ?? 0
  const videoCount = groupCounts.find((g) => g.type === 'VIDEO')?._count._all ?? 0
  const counts = { ALL: textCount + videoCount, TEXT: textCount, VIDEO: videoCount }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 헤더 배너 */}
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Field Story</p>
          <h1 className="text-2xl font-bold">현장스토리</h1>
          <p className="mt-2 text-blue-200 text-sm">이주민 사역 현장의 이야기를 나눕니다.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === 'ALL' ? '/story' : `/story?type=${tab.key}`}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#1B3A6B] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#1B3A6B] hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'opacity-70' : 'text-gray-400'}`}>
                {counts[tab.key]}
              </span>
            </Link>
          ))}
        </div>

        {/* 목록 */}
        {stories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-3">
              {activeTab === 'VIDEO' ? '🎬' : activeTab === 'TEXT' ? '📄' : '✍️'}
            </p>
            <p className="text-sm text-gray-400">아직 등록된 스토리가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                content={story.content}
                type={story.type}
                videoUrl={story.videoUrl}
                thumbnail={story.thumbnail}
                authorName={story.author.name}
                createdAt={story.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
