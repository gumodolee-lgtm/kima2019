import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import orgsData from '@/data/gmfsns_orgs.json'
import { OrgDetailMap } from './OrgDetailMap'

// Supabase에 저장된 편집 내용을 가져와 기본 JSON과 병합
async function getOrgWithOverride(org: Org, id: string): Promise<Org> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/member/gmfsns-orgs/${id}`, { cache: 'no-store' })
    if (!res.ok) return org
    const { data } = await res.json()
    if (!data) return org
    return {
      ...org,
      type: data.type ?? org.type,
      targets: data.targets?.length ? data.targets : (org as any).targets ?? [],
      languages: data.languages?.length ? data.languages : org.languages,
      address: data.address ?? org.address,
      phone: data.phone ?? org.phone,
      email: data.email ?? org.email,
      website: data.website ?? org.website,
      image: data.image_url ?? org.image,
      introLines: data.intro_lines?.length ? data.intro_lines : org.introLines,
      contactItems: data.contact_items?.length ? data.contact_items : org.contactItems,
    }
  } catch {
    return org
  }
}

interface Org {
  id: number
  name: string
  type: string
  languages: string[]
  targets?: string[]
  address: string
  phone: string
  email: string
  website: string
  description: string
  image: string | null
  date: string | null
  lat: number | null
  lng: number | null
  introLines?: string[]
  contactItems?: string[]
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
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/network/mission-map')
  }

  const { id } = await params
  const baseOrg = orgs.find((o) => String(o.id) === id)
  if (!baseOrg) notFound()

  const org = await getOrgWithOverride(baseOrg, id)

  const introLines = org.introLines?.length ? org.introLines : []
  const contactItems = org.contactItems?.length ? org.contactItems : []

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#1B3A6B]">홈</Link>
          <span>/</span>
          <Link href="/network/mission-map" className="hover:text-[#1B3A6B]">이주민 단체 지도</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{org.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Type badge + Title + Edit button */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {org.type && (
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 mb-2">
                {org.type}
              </span>
            )}
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{org.name}</h1>
            {org.date && (
              <p className="mt-1 text-xs text-gray-400">{org.date}</p>
            )}
          </div>
          <Link
            href={`/network/mission-map/${org.id}/edit`}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            정보 수정
          </Link>
        </div>

        {/* Main image — full content width */}
        {org.image && (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 border border-gray-100">
            <Image
              src={org.image}
              alt={org.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* 사역소개 */}
        {introLines.length > 0 && (
          <div className="mb-6">
            <p className="font-bold text-gray-800 mb-2">사역소개:</p>
            <ul className="space-y-1 pl-1">
              {introLines.map((line, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 사역대상 */}
        {(org.targets || []).length > 0 && (
          <div className="mb-6">
            <p className="font-bold text-gray-800 mb-2">사역대상:</p>
            <div className="flex flex-wrap gap-2">
              {(org.targets || []).map((t: string) => (
                <span key={t} className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* 사역민족(언어) */}
        {org.languages?.length > 0 && (
          <div className="mb-6">
            <p className="font-bold text-gray-800 mb-2">사역민족(언어):</p>
            <p className="text-sm text-gray-700">{org.languages.join(', ')}</p>
          </div>
        )}

        {/* 연결정보 */}
        {contactItems.length > 0 && (
          <div className="mb-6">
            <p className="font-bold text-gray-800 mb-2">연결정보:</p>
            <ul className="space-y-1 pl-1">
              {contactItems.map((item, i) => {
                // Detect URLs and emails for linking
                const urlMatch = item.match(/(https?:\/\/[^\s]+)/)
                const emailMatch = item.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6})/)
                return (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {urlMatch ? (
                      <span>
                        {item.substring(0, item.indexOf(urlMatch[1]))}
                        <a
                          href={urlMatch[1]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1B3A6B] hover:underline break-all"
                        >
                          {urlMatch[1]}
                        </a>
                        {item.substring(item.indexOf(urlMatch[1]) + urlMatch[1].length)}
                      </span>
                    ) : emailMatch ? (
                      <span>
                        {item.substring(0, item.indexOf(emailMatch[1]))}
                        <a
                          href={`mailto:${emailMatch[1]}`}
                          className="text-[#1B3A6B] hover:underline"
                        >
                          {emailMatch[1]}
                        </a>
                        {item.substring(item.indexOf(emailMatch[1]) + emailMatch[1].length)}
                      </span>
                    ) : (
                      <span>{item}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Fallback contact info if no contactItems */}
        {contactItems.length === 0 && (org.phone || org.email || org.website || org.address) && (
          <div className="mb-6">
            <p className="font-bold text-gray-800 mb-2">연결정보:</p>
            <ul className="space-y-1 pl-1">
              {org.phone && (
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span>전화번호: <a href={`tel:${org.phone}`} className="text-[#1B3A6B] hover:underline">{org.phone}</a></span>
                </li>
              )}
              {org.email && (
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span>이메일: <a href={`mailto:${org.email}`} className="text-[#1B3A6B] hover:underline">{org.email}</a></span>
                </li>
              )}
              {org.website && (
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span>홈페이지: <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-[#1B3A6B] hover:underline break-all">{org.website}</a></span>
                </li>
              )}
              {org.address && (
                <li className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <span>주소: {org.address}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* GMFSNS 원본 링크 */}
        <div className="mb-6">
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
          <div className="mb-6">
            <p className="font-bold text-gray-800 mb-2">위치:</p>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-100">
              <OrgDetailMap lat={org.lat} lng={org.lng} name={org.name} />
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            href="/network/mission-map"
            className="inline-flex items-center gap-1.5 text-sm text-[#1B3A6B] font-medium hover:underline"
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
