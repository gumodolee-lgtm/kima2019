import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [totalUsers, pendingOrgs, totalResources, upcomingEvents] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count({ where: { isPublic: false } }),
    prisma.resource.count(),
    prisma.event.count({ where: { scheduledAt: { gte: new Date() } } }),
  ])

  const recentMembers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const ROLE_LABELS: Record<string, string> = {
    MEMBER: '일반회원',
    PREMIUM: '정회원',
    OFFICER: '임원',
    ADMIN: '관리자',
  }
  const ROLE_COLORS: Record<string, string> = {
    MEMBER: 'bg-gray-100 text-gray-600',
    PREMIUM: 'bg-amber-100 text-amber-700',
    OFFICER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
  }

  const stats = [
    { label: '전체 회원', value: totalUsers, href: '/admin/members', color: 'bg-blue-50 border-blue-200' },
    { label: '단체 승인 대기', value: pendingOrgs, href: '/admin/organizations', color: 'bg-orange-50 border-orange-200', highlight: pendingOrgs > 0 },
    { label: '등록 자료', value: totalResources, href: '/admin/resources', color: 'bg-green-50 border-green-200' },
    { label: '예정 일정', value: upcomingEvents, href: '/admin/events', color: 'bg-purple-50 border-purple-200' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B]">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">KIMA 홈페이지 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow ${stat.highlight ? 'border-orange-400 ring-1 ring-orange-300' : 'border-gray-100'}`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-[#1B3A6B] mt-1">{stat.value}</p>
            {stat.highlight && (
              <p className="text-xs text-orange-600 mt-1 font-medium">검토 필요</p>
            )}
          </Link>
        ))}
      </div>

      {/* 최근 가입 회원 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">최근 가입 회원</h2>
          <Link href="/admin/members" className="text-sm text-[#1B3A6B] hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentMembers.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">가입 회원이 없습니다.</p>
          ) : (
            recentMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(m.name ?? m.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.name ?? '(이름 없음)'}</p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[m.role]}`}>
                  {ROLE_LABELS[m.role]}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {m.createdAt.toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
