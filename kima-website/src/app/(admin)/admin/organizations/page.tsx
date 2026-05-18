import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OrgApproveForm } from '@/components/admin/OrgApproveForm'
import { OrgEditForm } from '@/components/admin/OrgEditForm'
import { GeocodeButton } from '@/components/admin/GeocodeButton'
import { NormalizeAddressButton } from '@/components/admin/NormalizeAddressButton'
import { AutoNormalizeRegions } from '@/components/admin/AutoNormalizeRegions'
import { DeleteOrgButton } from '@/components/admin/DeleteOrgButton'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: '단체 관리 | KIMA 관리자' }

interface PageProps {
  searchParams: Promise<{ tab?: string; q?: string; sort?: string }>
}

export default async function AdminOrganizationsPage({ searchParams }: PageProps) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'ADMIN' && role !== 'OFFICER') redirect('/')

  const { tab, q, sort } = await searchParams
  const showAll = tab === 'all'

  const orderBy: Prisma.OrganizationOrderByWithRelationInput =
    sort === 'name' ? { name: 'asc' } :
    sort === 'region' ? { region: 'asc' } :
    { createdAt: 'desc' }

  const where: Prisma.OrganizationWhereInput = {
    ...(showAll ? {} : { isPublic: false }),
    ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
  }

  const [orgs, pendingCount] = await Promise.all([
    prisma.organization.findMany({ where, orderBy }),
    prisma.organization.count({ where: { isPublic: false } }),
  ])

  // 레거시 region 값(서울경기인천 등)이 남은 경우 클라이언트에서 자동 정규화
  const allRegions = orgs.map((o) => o.region)

  return (
    <div>
      <AutoNormalizeRegions regions={allRegions} />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B3A6B]">단체 관리</h1>
          <p className="text-sm text-gray-500 mt-1">단체를 검색하고 수정·승인·반려합니다.</p>
        </div>
        <div className="flex flex-col gap-2">
          <NormalizeAddressButton />
          <GeocodeButton />
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        <a
          href={`/admin/organizations${q ? `?q=${encodeURIComponent(q)}` : ''}`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
            !showAll ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-gray-500 hover:text-gray-700'
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
          href={`/admin/organizations?tab=all${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            showAll ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          전체 단체
        </a>
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form method="GET" action="/admin/organizations" className="flex-1 flex gap-2">
          {showAll && <input type="hidden" name="tab" value="all" />}
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="단체명 검색…"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] transition-colors"
          >
            검색
          </button>
          {q && (
            <a
              href={`/admin/organizations${showAll ? '?tab=all' : ''}`}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              초기화
            </a>
          )}
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">정렬:</span>
          {(['', 'name', 'region'] as const).map((s) => {
            const labels: Record<string, string> = { '': '최근순', name: '이름순', region: '지역순' }
            const params = new URLSearchParams()
            if (showAll) params.set('tab', 'all')
            if (q) params.set('q', q)
            if (s) params.set('sort', s)
            return (
              <a
                key={s}
                href={`/admin/organizations?${params.toString()}`}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  (sort ?? '') === s
                    ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {labels[s]}
              </a>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">{orgs.length}개 단체{q && ` (검색: "${q}")`}</p>

      {/* 목록 */}
      <div className="space-y-4">
        {orgs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            {q ? `"${q}"에 해당하는 단체가 없습니다.` : showAll ? '등록된 단체가 없습니다.' : '승인 대기 단체가 없습니다.'}
          </div>
        ) : (
          orgs.map((org) => (
            <div key={org.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    {org.nameEn && <span className="text-xs text-gray-400">({org.nameEn})</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      org.isPublic ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {org.isPublic ? '공개' : '대기'}
                    </span>
                    {(org as any).source === 'gmfsns' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        GMFSNS
                      </span>
                    )}
                    {!(org as any).source && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                        직접등록
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>지역: {org.region}</span>
                    {org.languages.length > 0 && <span>언어권: {org.languages.join(', ')}</span>}
                    {org.targets.length > 0 && <span>대상: {org.targets.join(', ')}</span>}
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
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        🌐 웹사이트
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-300">
                    신청일: {org.createdAt.toLocaleDateString('ko-KR')}
                  </p>
                </div>

                <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                  <OrgEditForm org={org} />
                  {!org.isPublic && <OrgApproveForm orgId={org.id} orgName={org.name} />}
                  <DeleteOrgButton orgId={org.id} orgName={org.name} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
