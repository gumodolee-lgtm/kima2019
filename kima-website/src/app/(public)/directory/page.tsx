'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Organization } from '@prisma/client'
import { OrganizationCard } from '@/components/directory/OrganizationCard'
import { FilterBar } from '@/components/directory/FilterBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'

const MapComponent = dynamic(
  () => import('@/components/directory/MapComponent').then((m) => m.MapComponent),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" /> }
)

function DirectoryContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  useEffect(() => {
    const params = new URLSearchParams()
    const region = searchParams.get('region')
    const language = searchParams.get('language')
    const target = searchParams.get('target')
    const type = searchParams.get('type')
    if (region) params.set('region', region)
    if (language) params.set('language', language)
    if (target) params.set('target', target)
    if (type) params.set('type', type)

    setLoading(true)
    fetch(`/api/organizations?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setOrgs(data.organizations ?? []))
      .finally(() => setLoading(false))
  }, [searchParams])

  const isLoggedIn = !!session?.user

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      {/* 필터 */}
      <div className="shrink-0">
        <FilterBar totalCount={orgs.length} />
      </div>

      {/* 지도 + 목록 */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4">
        {/* 지도 — 모바일 50vh, 데스크탑 전체 높이 */}
        <div className="h-[50vh] lg:h-full lg:w-1/2 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0">
          <MapComponent
            organizations={orgs}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* 단체 목록 */}
        <div className="lg:w-1/2 flex flex-col gap-3 overflow-y-auto pb-4 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : orgs.length === 0 ? (
            <EmptyState
              title="등록된 단체가 없습니다"
              description="다른 필터 조건으로 검색해 보세요."
              action={
                <Link
                  href="/directory"
                  className="text-sm text-[#1B3A6B] font-medium hover:underline"
                >
                  필터 초기화
                </Link>
              }
            />
          ) : (
            orgs.map((org) => (
              <OrganizationCard
                key={org.id}
                org={org}
                isSelected={selectedId === org.id}
                onSelect={() => setSelectedId(org.id)}
                showContact={isLoggedIn}
              />
            ))
          )}

          {!isLoggedIn && orgs.length > 0 && (
            <p className="text-xs text-center text-gray-400 mt-2">
              연락처 확인은{' '}
              <Link href="/auth/login" className="text-[#1B3A6B] underline">
                로그인
              </Link>{' '}
              후 이용하실 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <div className="bg-[#F8F9FA] flex flex-col h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 w-full flex flex-col flex-1 min-h-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A6B]">국내 이주민 사역지도</h1>
            <p className="mt-0.5 text-sm text-gray-500">전국 다문화 사역 단체를 찾아보세요</p>
          </div>
          <Link
            href="/directory/register"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#15305a] transition-colors"
          >
            + 단체 등록 신청
          </Link>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <DirectoryContent />
        </Suspense>
      </div>
    </div>
  )
}
