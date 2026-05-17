'use client'

import dynamic from 'next/dynamic'
import Script from 'next/script'
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
    <>
      {/* ── 모바일 레이아웃 ── */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-80px)]">
        <div className="shrink-0 px-4 pt-4 pb-3 bg-[#F8F9FA] border-b border-gray-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-[#1B3A6B]">국내 이주민 사역지도</h1>
              <p className="text-xs text-gray-500 mt-0.5">전국 다문화 사역 단체를 찾아보세요</p>
            </div>
            <Link
              href="/directory/register"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1B3A6B] text-white text-xs font-medium hover:bg-[#15305a]"
            >
              + 등록 신청
            </Link>
          </div>
          <FilterBar totalCount={orgs.length} />
        </div>
        <div className="h-[40vh] shrink-0">
          <MapComponent organizations={orgs} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
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
        </div>
      </div>

      {/* ── 데스크탑 레이아웃: 지도 전체화면 + 오버레이 ── */}
      <div className="hidden lg:block relative h-[calc(100vh-80px)]">

        {/* 지도 — 전체 배경 */}
        <div className="absolute inset-0 z-0">
          <MapComponent organizations={orgs} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* 상단 왼쪽 오버레이 — 제목 카드 */}
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-5 py-3">
            <h1 className="text-base font-bold text-[#1B3A6B] leading-tight">국내 이주민 사역지도</h1>
            <p className="text-xs text-gray-400 mt-0.5">전국 다문화 사역 단체</p>
          </div>
        </div>

        {/* 상단 중앙 오버레이 — 필터 */}
        <div className="absolute top-4 left-52 right-[352px] z-[1000]">
          <FilterBar totalCount={orgs.length} />
        </div>

        {/* 오른쪽 패널 — 단체 목록 */}
        <div className="absolute right-0 top-0 bottom-0 w-[340px] z-[999] bg-white shadow-2xl flex flex-col">
          {/* 패널 헤더 */}
          <div className="px-5 py-4 bg-[#1B3A6B] shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">등록 단체 현황</p>
                <p className="text-blue-200 text-xs mt-0.5">
                  {loading ? '불러오는 중…' : `${orgs.length}개 단체`}
                </p>
              </div>
              <Link
                href="/directory/register"
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white text-[#1B3A6B] text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                + 단체 등록
              </Link>
            </div>
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
    </>
  )
}

export default function DirectoryPage() {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY

  return (
    <>
      {kakaoKey && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`}
          strategy="afterInteractive"
        />
      )}
      <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-80px)]"><LoadingSpinner /></div>}>
        <DirectoryContent />
      </Suspense>
    </>
  )
}
