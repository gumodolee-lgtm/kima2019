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
    <div className="flex flex-col gap-4 h-full">
      {/* 필터 */}
      <FilterBar totalCount={orgs.length} />

      {/* 지도 + 목록 */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* 지도 */}
        <div className="lg:w-1/2 h-[400px] lg:h-auto rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <MapComponent
            organizations={orgs}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* 단체 목록 */}
        <div className="lg:w-1/2 flex flex-col gap-3 lg:overflow-y-auto lg:max-h-[calc(100vh-280px)] pr-1">
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
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A6B]">단체 디렉토리</h1>
            <p className="mt-1 text-sm text-gray-500">전국 다문화 사역 단체를 찾아보세요</p>
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
