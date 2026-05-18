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
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" /> }
)

function DirectoryContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [hoveredId, setHoveredId] = useState<string | undefined>()

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
    <div className="flex flex-col h-[calc(100vh-80px)]">

      {/* ── 상단: 제목 + 필터 ──────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-4">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-[#1B3A6B]">사역단체 전국지도</h1>
              <p className="text-xs text-gray-400 mt-0.5">전국 다문화 사역 단체를 찾아보세요</p>
            </div>
            <Link
              href="/directory/register"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1B3A6B] text-white text-xs font-medium hover:bg-[#15305a] shrink-0"
            >
              + 단체 등록
            </Link>
          </div>
          <FilterBar totalCount={orgs.length} />
        </div>
      </div>

      {/* ── 하단: 지도 + 목록 ──────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* 지도 */}
        <div className="flex-1 min-w-0 relative">
          <MapComponent
            organizations={orgs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
            showContact={isLoggedIn}
          />
        </div>

        {/* 오른쪽 목록 패널 */}
        <div className="w-[320px] xl:w-[360px] shrink-0 flex flex-col bg-white border-l border-gray-100 shadow-xl">
          {/* 패널 헤더 */}
          <div className="px-5 py-3 bg-[#1B3A6B] shrink-0">
            <p className="text-white font-bold text-sm">등록 단체 현황</p>
            <p className="text-blue-200 text-xs mt-0.5">
              {loading ? '불러오는 중…' : `${orgs.length}개 단체`}
            </p>
          </div>

          {/* 목록 */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : orgs.length === 0 ? (
              <EmptyState
                title="등록된 단체가 없습니다"
                description="다른 필터 조건으로 검색해 보세요."
                action={
                  <Link href="/directory" className="text-sm text-[#1B3A6B] font-medium hover:underline">
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
                  isHovered={hoveredId === org.id}
                  onSelect={() => setSelectedId(org.id)}
                  showContact={isLoggedIn}
                />
              ))
            )}

            {!isLoggedIn && orgs.length > 0 && (
              <p className="text-xs text-center text-gray-400 mt-1 pb-2">
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
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-80px)]"><LoadingSpinner /></div>}>
      <DirectoryContent />
    </Suspense>
  )
}
