import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CommunityTabs } from '@/components/community/CommunityTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '커뮤니티 | KIMA' }

export default async function CommunityPage() {
  const [categories] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] }),
    auth(),
  ])

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">커뮤니티</h1>
          <p className="mt-2 text-sm text-gray-500">
            지역별·언어권별·사역대상별 카테고리에서 공지와 사역 나눔을 확인하세요
          </p>
        </div>

        <CommunityTabs categories={categories} />
      </div>
    </div>
  )
}
