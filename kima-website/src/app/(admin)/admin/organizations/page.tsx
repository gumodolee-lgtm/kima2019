import { prisma } from '@/lib/prisma'
import { OrgApproveForm } from '@/components/admin/OrgApproveForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '단체 승인 | KIMA 관리자' }

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminOrganizationsPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const showAll = tab === 'all'

  const orgs = await prisma.organization.findMany({
    where: showAll ? undefined : { isPublic: false },
    orderBy: { createdAt: 'desc' },
  })

  const pendingCount = await prisma.organization.count({ where: { isPublic: false } })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1B3A6B]">단체 승인 관리</h1>
        <p className="text-sm text-gray-500 mt-1">신청된 단체를 검토하고 승인 또는 반려합니다.</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <a
          href="/admin/organizations"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
            !showAll
              ? 'border-[#1B3A6B] text-[#1B3A6B]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          승인 대기
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </a>
        <a
          href="/admin/organizations?tab=all"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            showAll
              ? 'border-[#1B3A6B] text-[#1B3A6B]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          전체 단체
        </a>
      </div>

      <div className="space-y-4">
        {orgs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            {showAll ? '등록된 단체가 없습니다.' : '승인 대기 단체가 없습니다.'}
          </div>
        ) : (
          orgs.map((org) => (
            <div key={org.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    {org.nameEn && (
                      <span className="text-xs text-gray-400">({org.nameEn})</span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        org.isPublic
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {org.isPublic ? '공개' : '대기'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>지역: {org.region}</span>
                    {org.languages.length > 0 && (
                      <span>언어권: {org.languages.join(', ')}</span>
                    )}
                    {org.targets.length > 0 && (
                      <span>대상: {org.targets.join(', ')}</span>
                    )}
                    {org.type && <span>유형: {org.type}</span>}
                  </div>
                  {org.description && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{org.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                    {org.address && <span>📍 {org.address}</span>}
                    {org.phone && <span>📞 {org.phone}</span>}
                    {org.email && <span>✉️ {org.email}</span>}
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        🌐 웹사이트
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-300">
                    신청일: {org.createdAt.toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {!org.isPublic && (
                  <div className="flex-shrink-0">
                    <OrgApproveForm orgId={org.id} orgName={org.name} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
