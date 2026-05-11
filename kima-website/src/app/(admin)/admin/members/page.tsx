import { prisma } from '@/lib/prisma'
import { MemberRoleForm } from '@/components/admin/MemberRoleForm'
import type { Metadata } from 'next'
import type { UserRole } from '@prisma/client'

export const metadata: Metadata = { title: '회원 관리 | KIMA 관리자' }

const ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: '일반회원',
  PREMIUM: '정회원',
  OFFICER: '임원',
  ADMIN: '관리자',
}
const ROLE_COLORS: Record<UserRole, string> = {
  MEMBER: 'bg-gray-100 text-gray-600',
  PREMIUM: 'bg-amber-100 text-amber-700',
  OFFICER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminMembersPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const isPendingTab = tab === 'pending'

  const users = await prisma.user.findMany({
    where: isPendingTab
      ? { role: 'MEMBER', premiumNote: { not: null } }
      : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      premiumNote: true,
      approvedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  const pendingCount = await prisma.user.count({
    where: { role: 'MEMBER', premiumNote: { not: null } },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1B3A6B]">회원 관리</h1>
        <p className="text-sm text-gray-500 mt-1">회원 등급 변경 및 납부 메모를 관리합니다.</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <a
          href="/admin/members"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            !isPendingTab
              ? 'border-[#1B3A6B] text-[#1B3A6B]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          전체 회원
        </a>
        <a
          href="/admin/members?tab=pending"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
            isPendingTab
              ? 'border-[#1B3A6B] text-[#1B3A6B]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          정회원 신청 대기
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </a>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {users.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">
            {isPendingTab ? '정회원 신청 대기 회원이 없습니다.' : '회원이 없습니다.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium">
                <th className="px-4 py-3 text-left">이름 / 이메일</th>
                <th className="px-4 py-3 text-left">소속</th>
                <th className="px-4 py-3 text-left">가입일</th>
                <th className="px-4 py-3 text-left">등급 / 메모</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(user.name ?? user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name ?? '(없음)'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.organization ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {user.createdAt.toLocaleDateString('ko-KR')}
                    {user.expiresAt && (
                      <p className="text-orange-500 mt-0.5">
                        만료: {user.expiresAt.toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <span className={`self-start px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                      <MemberRoleForm
                        userId={user.id}
                        currentRole={user.role}
                        currentNote={user.premiumNote}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
