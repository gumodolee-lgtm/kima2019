import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import orgsData from '@/data/gmfsns_orgs.json'
import { OrgDetailMap } from './OrgDetailMap'

interface Org {
  id: number
  name: string
  type: string
  languages: string[]
  address: string
  phone: string
  email: string
  website: string
  description: string
  fullDescription?: string
  image: string | null
  date: string | null
  lat: number | null
  lng: number | null
}

const orgs = orgsData as unknown as Org[]

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const org = orgs.find((o) => String(o.id) === id)
  return {
    title: org ? `${org.name} | 이주민 단체 지도 | KIMA` : '단체 정보 | KIMA',
    description: org?.description ?? '',
  }
}

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !(['OFFICER', 'ADMIN'] as string[]).includes(session.user.role)) {
    redirect('/community')
  }

  const { id } = await params
  const org = orgs.find((o) => String(o.id) === id)
  if (!org) notFound()

  const descLines = (org.fullDescription || org.description || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#1B3A6B]">홈</Link>
          <span>/</span>
          <Link href="/network/mission-map" className="hover:text-[#1B3A6B]">이주민 단체</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{org.name}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          {org.type && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 mb-3">
              {org.type}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{org.name}</h1>
          {org.date && (
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {org.date}
            </p>
          )}
        </div>

        {/* Main image */}
        {org.image && (
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden mb-8 border border-gray-100 shadow-sm">
            <Image
              src={org.image}
              alt={org.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 512px"
              priority
            />
          </div>
        )}

        {/* Content sections */}
        <div className="space-y-8">

          {/* 사역소개 */}
          {descLines.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-[#1B3A6B] border-b border-gray-100 pb-2 mb-4">사역소개</h2>
              <div className="space-y-1">
                {descLines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
                ))}
              </div>
            </section>
          )}

          {/* 사역민족(언어) */}
          {org.languages.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-[#1B3A6B] border-b border-gray-100 pb-2 mb-4">
                사역민족(언어)
              </h2>
              <div className="flex flex-wrap gap-2">
                {org.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 연결정보 */}
          {(org.phone || org.email || org.website || org.address) && (
            <section>
              <h2 className="text-sm font-bold text-[#1B3A6B] border-b border-gray-100 pb-2 mb-4">연결정보</h2>
              <div className="space-y-3">
                {org.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-20 shrink-0">전화번호</span>
                    <a
                      href={`tel:${org.phone}`}
                      className="text-sm text-[#1B3A6B] font-medium hover:underline"
                    >
                      {org.phone}
                    </a>
                  </div>
                )}
                {org.email && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-20 shrink-0">이메일</span>
                    <a
                      href={`mailto:${org.email}`}
                      className="text-sm text-[#1B3A6B] hover:underline break-all"
                    >
                      {org.email}
                    </a>
                  </div>
                )}
                {org.website && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-400 w-20 shrink-0 mt-0.5">홈페이지</span>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1B3A6B] hover:underline break-all"
                    >
                      {org.website}
                    </a>
                  </div>
                )}
                {org.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-400 w-20 shrink-0 mt-0.5">주소</span>
                    <span className="text-sm text-gray-700">{org.address}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* GMFSNS 원본 링크 */}
          <div className="pt-2">
            <a
              href={`https://gmfsns.org/mapview/${org.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1B3A6B] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              GMFSNS 원본 보기
            </a>
          </div>

          {/* Map */}
          {org.lat && org.lng && (
            <section>
              <h2 className="text-sm font-bold text-[#1B3A6B] border-b border-gray-100 pb-2 mb-4">위치</h2>
              <div className="h-72 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <OrgDetailMap lat={org.lat} lng={org.lng} name={org.name} />
              </div>
            </section>
          )}
        </div>

        {/* Back button */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link
            href="/network/mission-map"
            className="inline-flex items-center gap-2 text-sm text-[#1B3A6B] font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
