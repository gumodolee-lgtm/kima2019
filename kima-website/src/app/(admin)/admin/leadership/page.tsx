import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LeadershipClient } from './LeadershipClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: '임원단 관리 | KIMA 관리자' }

export default async function AdminLeadershipPage() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'ADMIN' && role !== 'OFFICER') redirect('/')

  const leaders = await prisma.leader.findMany({
    orderBy: [{ group: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  }).catch(() => [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1B3A6B]">임원단 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          임원단 소개 페이지에 표시될 임원을 관리합니다. 추가·수정·삭제한 내용은 즉시 반영됩니다.
        </p>
      </div>
      <LeadershipClient initialLeaders={leaders} />
    </div>
  )
}
