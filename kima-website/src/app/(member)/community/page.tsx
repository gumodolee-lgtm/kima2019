import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CommunityTabs } from '@/components/community/CommunityTabs'
import type { Metadata } from 'next'
import type { CategoryType } from '@prisma/client'

export const metadata: Metadata = { title: '사역별 커뮤니티 | KIMA' }

const TAB_MAP: Record<string, CategoryType> = {
  region:   'REGION',
  language: 'LANGUAGE',
  target:   'TARGET',
  REGION:   'REGION',
  LANGUAGE: 'LANGUAGE',
  TARGET:   'TARGET',
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const defaultTab: CategoryType = (tab && TAB_MAP[tab]) ? TAB_MAP[tab] : 'REGION'

  const [categories] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] }),
    auth(),
  ])

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">사역별 커뮤니티</h1>
          <p className="mt-2 text-sm text-gray-500">
            지역별·언어권별·사역대상별 카테고리에서 공지와 사역 나눔을 확인하세요
          </p>
        </div>

        <CommunityTabs categories={categories} defaultTab={defaultTab} />
      </div>
    </div>
  )
}
