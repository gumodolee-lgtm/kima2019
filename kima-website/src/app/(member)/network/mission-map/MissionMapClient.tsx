'use client'

import { useState, useMemo } from 'react'

interface GmfsnsOrg {
  id: number
  name: string
  nameEn: string
  description: string
  address: string
  region: string
  languages: string[]
  targets: string[]
  type: string
  phone: string
  email: string
  website: string
  lat: number | null
  lng: number | null
}

interface Props {
  orgs: GmfsnsOrg[]
}

const ALL_LANGUAGES = ['네팔', '러시아', '다문화', '영어', '베트남', '태국', '라오', '몽족', '한국어']
const ALL_TYPES = ['교회', '유학생센터', '국제학생회', '사역단체']

export function MissionMapClient({ orgs }: Props) {
  const [langFilter, setLangFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = useMemo(() => {
    return orgs.filter((org) => {
      if (langFilter && !org.languages.includes(langFilter)) return false
      if (typeFilter && org.type !== typeFilter) return false
      return true
    })
  }, [orgs, langFilter, typeFilter])

  const hasFilter = langFilter || typeFilter

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 헤더 */}
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">
            Mission Map
          </p>
          <h1 className="text-3xl font-bold">이주민 단체 지도</h1>
          <p className="mt-2 text-blue-200 text-sm">
            전국 이주민 선교 단체 — GMFSNS 데이터 기반
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 필터 바 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-[#1B3A6B] shrink-0">필터</span>

          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="">언어권 전체</option>
            {ALL_LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">유형 전체</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {hasFilter && (
            <button
              onClick={() => { setLangFilter(''); setTypeFilter('') }}
              className="text-xs text-red-500 hover:text-red-700 font-medium underline"
            >
              초기화
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400 shrink-0">
            {filtered.length}개 단체
          </span>
        </div>

        {/* 카드 그리드 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">해당 조건의 단체가 없습니다</p>
            <button
              onClick={() => { setLangFilter(''); setTypeFilter('') }}
              className="mt-3 text-sm text-[#1B3A6B] font-medium hover:underline"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        )}

        {/* 출처 안내 */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>
            본 자료는{' '}
            <a
              href="https://gmfsns.org/missionmap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B3A6B] underline hover:text-[#C8922A]"
            >
              GMFSNS 이주민 선교 단체 지도
            </a>
            에서 제공한 데이터를 기반으로 합니다.
          </p>
          <p className="mt-1">단체 정보 추가·수정 문의: kima20191227@gmail.com</p>
        </div>
      </div>
    </div>
  )
}

function OrgCard({ org }: { org: GmfsnsOrg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#1B3A6B] leading-tight">{org.name}</h3>
          {org.nameEn && org.nameEn !== org.name && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{org.nameEn}</p>
          )}
        </div>
        {org.type && (
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            {org.type}
          </span>
        )}
      </div>

      {/* 언어권 태그 */}
      {org.languages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {org.languages.map((lang) => (
            <span key={lang} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* 소개 */}
      {org.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{org.description}</p>
      )}

      {/* 주소 */}
      {org.address && (
        <p className="text-xs text-gray-400 flex items-start gap-1">
          <svg className="w-3 h-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{org.address}</span>
        </p>
      )}

      {/* 연락처 */}
      {(org.phone || org.email || org.website) && (
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
          {org.phone && (
            <a href={`tel:${org.phone}`} className="flex items-center gap-1 hover:text-[#1B3A6B]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {org.phone}
            </a>
          )}
          {org.email && (
            <a href={`mailto:${org.email}`} className="flex items-center gap-1 hover:text-[#1B3A6B]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {org.email}
            </a>
          )}
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#1B3A6B]"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              웹사이트
            </a>
          )}
        </div>
      )}
    </div>
  )
}
