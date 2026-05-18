'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface GmfsnsOrg {
  id: number
  name: string
  type: string
  languages: string[]
  address: string
  phone: string
  email: string
  website: string
  description: string
  introLines?: string[]
  contactItems?: string[]
  image: string | null
  date: string | null
  lat: number | null
  lng: number | null
}

interface Props {
  orgs: GmfsnsOrg[]
}

const TYPE_OPTIONS = ['교회', '선교단체', '센터', '복지기관', 'NGO', '공공기관', '의료기관', '교육기관', '기타']
const LANG_OPTIONS = ['네팔', '베트남', '태국', '라오', '몽족', '몽골', '러시아', '중국', '동포', '필리핀', '인도네시아', '캄보디아', '미얀마', '영어', '일본', '스리랑카', '아랍', '우즈벡', '힌두', '이슬람', '인도']

export function MissionMapClient({ orgs }: Props) {
  const [typeFilters, setTypeFilters]     = useState<Set<string>>(new Set())
  const [langFilters, setLangFilters]     = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery]     = useState('')
  const [searchApplied, setSearchApplied] = useState('')

  // Derive available options from actual data
  const availableTypes = useMemo(() => {
    const s = new Set(orgs.map((o) => o.type).filter(Boolean))
    return TYPE_OPTIONS.filter((t) => s.has(t))
  }, [orgs])

  const availableLangs = useMemo(() => {
    const s = new Set(orgs.flatMap((o) => o.languages))
    return LANG_OPTIONS.filter((l) => s.has(l))
  }, [orgs])

  const toggleType = (t: string) =>
    setTypeFilters((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })

  const toggleLang = (l: string) =>
    setLangFilters((prev) => { const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n })

  const clearAll = () => { setTypeFilters(new Set()); setLangFilters(new Set()); setSearchQuery(''); setSearchApplied('') }

  const filtered = useMemo(() => {
    return orgs.filter((org) => {
      if (typeFilters.size > 0 && !typeFilters.has(org.type)) return false
      if (langFilters.size > 0 && !org.languages.some((l) => langFilters.has(l))) return false
      if (searchApplied) {
        const q = searchApplied.toLowerCase()
        const hit = org.name.toLowerCase().includes(q)
          || org.description.toLowerCase().includes(q)
          || org.address.toLowerCase().includes(q)
          || org.languages.some((l) => l.includes(q))
        if (!hit) return false
      }
      return true
    })
  }, [orgs, typeFilters, langFilters, searchApplied])

  const hasFilter = typeFilters.size > 0 || langFilters.size > 0 || searchApplied

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-[#1B3A6B] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C8922A] text-xs font-semibold tracking-widest uppercase mb-1">Network</p>
          <h1 className="text-2xl font-bold">이주민 단체 지도</h1>
          <p className="text-blue-200 text-sm mt-1">전국 이주민 선교 단체 현황</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ── Filters ───────────────────────────────────── */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-5 py-5 mb-8 space-y-4">

          {/* Type filters */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-12 shrink-0">유형</span>
            {availableTypes.map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={typeFilters.has(t)}
                  onChange={() => toggleType(t)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B]"
                />
                <span className="text-sm text-gray-700">{t}</span>
              </label>
            ))}
          </div>

          {/* Language filters */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-12 shrink-0">언어</span>
            {availableLangs.map((l) => (
              <label key={l} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={langFilters.has(l)}
                  onChange={() => toggleLang(l)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B]"
                />
                <span className="text-sm text-gray-700">{l}</span>
              </label>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearchApplied(searchQuery) }}
              placeholder="단체명, 지역, 언어 검색..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
            />
            <button
              type="button"
              onClick={() => setSearchApplied(searchQuery)}
              className="px-5 py-2 bg-[#1B3A6B] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors"
            >
              검색
            </button>
            {hasFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* ── Result count ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            총 <span className="font-bold text-[#1B3A6B]">{filtered.length}</span>개 단체
          </p>
        </div>

        {/* ── Card grid ─────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <p className="text-base font-medium">검색 결과가 없습니다</p>
            <button type="button" onClick={clearAll} className="mt-3 text-sm text-[#1B3A6B] font-medium hover:underline">
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrgCard({ org }: { org: GmfsnsOrg }) {
  const excerpt = org.introLines?.length
    ? org.introLines.slice(0, 2).join(' / ')
    : org.description?.slice(0, 100) || ''

  return (
    <Link
      href={`/network/mission-map/${org.id}`}
      className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {org.image ? (
          <Image
            src={org.image}
            alt={org.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B3A6B]/10 to-[#1B3A6B]/20">
            <svg className="w-12 h-12 text-[#1B3A6B]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
            </svg>
          </div>
        )}
        {/* Type badge */}
        {org.type && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-[#1B3A6B] shadow-sm">
            {org.type}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#1B3A6B] transition-colors line-clamp-2">
          {org.name}
        </h3>

        {org.date && (
          <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {org.date}
          </p>
        )}

        {org.languages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {org.languages.slice(0, 3).map((l) => (
              <span key={l} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 font-medium">{l}</span>
            ))}
            {org.languages.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400">+{org.languages.length - 3}</span>
            )}
          </div>
        )}

        {excerpt && (
          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
        )}

        <p className="mt-3 text-xs font-semibold text-[#C8922A] group-hover:underline">
          더 보기 →
        </p>
      </div>
    </Link>
  )
}
