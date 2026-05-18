'use client'

import { useState, useMemo, useRef } from 'react'
import { MissionMapKakao } from './MissionMapKakao'
import type { GmfsnsOrg } from './MissionMapKakao'

interface Props {
  orgs: GmfsnsOrg[]
}

export function MissionMapClient({ orgs }: Props) {
  const [langFilter, setLangFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedId, setSelectedId] = useState<number | undefined>()
  const [hoveredId, setHoveredId]   = useState<number | undefined>()
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const allLanguages = useMemo(() => {
    const set = new Set<string>()
    orgs.forEach((o) => o.languages.forEach((l) => set.add(l)))
    return [...set].sort()
  }, [orgs])

  const allTypes = useMemo(() => {
    const set = new Set<string>()
    orgs.forEach((o) => { if (o.type) set.add(o.type) })
    return [...set].sort()
  }, [orgs])

  const filtered = useMemo(() => {
    return orgs.filter((org) => {
      if (langFilter && !org.languages.includes(langFilter)) return false
      if (typeFilter && org.type !== typeFilter) return false
      return true
    })
  }, [orgs, langFilter, typeFilter])

  const hasFilter = langFilter || typeFilter

  const handleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? undefined : id))
    const el = cardRefs.current.get(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const clearFilters = () => { setLangFilter(''); setTypeFilter('') }

  return (
    <>
      {/* ── Mobile layout ──────────────────────────── */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-80px)]">
        <FilterBar
          langFilter={langFilter}
          typeFilter={typeFilter}
          allLanguages={allLanguages}
          allTypes={allTypes}
          count={filtered.length}
          hasFilter={!!hasFilter}
          onLang={setLangFilter}
          onType={setTypeFilter}
          onClear={clearFilters}
          compact
        />

        <div className="h-[40vh] shrink-0">
          <MissionMapKakao
            orgs={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-3 space-y-3">
          <CardList
            orgs={filtered}
            selectedId={selectedId}
            hoveredId={hoveredId}
            cardRefs={cardRefs}
            onSelect={handleSelect}
            onClear={clearFilters}
          />
        </div>
      </div>

      {/* ── Desktop layout ─────────────────────────── */}
      <div className="hidden lg:block relative h-[calc(100vh-80px)]">
        {/* Map — full background */}
        <div className="absolute inset-0">
          <MissionMapKakao
            orgs={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
        </div>

        {/* Title card — top left */}
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-4 py-3 z-10 max-w-[190px]">
          <p className="text-[10px] font-semibold text-[#C8922A] tracking-widest uppercase mb-0.5">Mission Map</p>
          <h1 className="text-sm font-bold text-[#1B3A6B] leading-snug">이주민 단체 지도</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">GMFSNS 연계</p>
        </div>

        {/* Filter bar — top center */}
        <div className="absolute top-4 left-52 right-[356px] z-10">
          <FilterBar
            langFilter={langFilter}
            typeFilter={typeFilter}
            allLanguages={allLanguages}
            allTypes={allTypes}
            count={filtered.length}
            hasFilter={!!hasFilter}
            onLang={setLangFilter}
            onType={setTypeFilter}
            onClear={clearFilters}
          />
        </div>

        {/* Right panel — 340px */}
        <div className="absolute top-0 right-0 bottom-0 w-[340px] bg-white flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.08)] z-10">
          <div className="bg-[#1B3A6B] text-white px-5 py-4 shrink-0">
            <p className="text-[10px] text-[#C8922A] font-semibold tracking-wider uppercase mb-1">이주민 선교 단체</p>
            <p className="text-lg font-bold">{filtered.length}개 단체</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-3 space-y-3">
            <CardList
              orgs={filtered}
              selectedId={selectedId}
              hoveredId={hoveredId}
              cardRefs={cardRefs}
              onSelect={handleSelect}
              onClear={clearFilters}
            />
          </div>

          <div className="px-4 py-3 border-t border-gray-100 text-center shrink-0">
            <p className="text-xs text-gray-400">
              출처:{' '}
              <a
                href="https://gmfsns.org/missionmap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1B3A6B] underline hover:text-[#C8922A]"
              >
                GMFSNS 이주민 단체 지도
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  langFilter: string
  typeFilter: string
  allLanguages: string[]
  allTypes: string[]
  count: number
  hasFilter: boolean
  onLang: (v: string) => void
  onType: (v: string) => void
  onClear: () => void
  compact?: boolean
}

function FilterBar({ langFilter, typeFilter, allLanguages, allTypes, count, hasFilter, onLang, onType, onClear, compact }: FilterBarProps) {
  const base = compact
    ? 'bg-white border-b border-gray-100 px-4 py-2.5 flex flex-wrap items-center gap-2 shrink-0'
    : 'bg-white rounded-xl shadow-lg px-4 py-2.5 flex flex-wrap items-center gap-3'
  const selectCls = compact
    ? 'text-xs border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30'
    : 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30'

  return (
    <div className={base}>
      <span className={compact ? 'text-xs font-semibold text-[#1B3A6B]' : 'text-sm font-semibold text-[#1B3A6B] shrink-0'}>
        필터
      </span>
      <select title="언어권 필터" className={selectCls} value={langFilter} onChange={(e) => onLang(e.target.value)}>
        <option value="">언어권 전체</option>
        {allLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <select title="유형 필터" className={selectCls} value={typeFilter} onChange={(e) => onType(e.target.value)}>
        <option value="">유형 전체</option>
        {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      {hasFilter && (
        <button type="button" onClick={onClear} className="text-xs text-red-500 font-medium underline">
          초기화
        </button>
      )}
      <span className="ml-auto text-xs text-gray-400 shrink-0">{count}개 단체</span>
    </div>
  )
}

// ── Card list ─────────────────────────────────────────────────────────────────

interface CardListProps {
  orgs: GmfsnsOrg[]
  selectedId: number | undefined
  hoveredId: number | undefined
  cardRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  onSelect: (id: number) => void
  onClear: () => void
}

function CardList({ orgs, selectedId, hoveredId, cardRefs, onSelect, onClear }: CardListProps) {
  if (orgs.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-sm font-medium">해당 조건의 단체가 없습니다</p>
        <button type="button" onClick={onClear} className="mt-2 text-xs text-[#1B3A6B] font-medium hover:underline">
          필터 초기화
        </button>
      </div>
    )
  }

  return (
    <>
      {orgs.map((org) => (
        <OrgCard
          key={org.id}
          org={org}
          isSelected={selectedId === org.id}
          isHovered={hoveredId === org.id}
          onClick={() => onSelect(org.id)}
          cardRef={(el) => {
            if (el) cardRefs.current.set(org.id, el)
            else cardRefs.current.delete(org.id)
          }}
        />
      ))}
    </>
  )
}

// ── Org card ──────────────────────────────────────────────────────────────────

interface OrgCardProps {
  org: GmfsnsOrg
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  cardRef: (el: HTMLDivElement | null) => void
}

function OrgCard({ org, isSelected, isHovered, onClick, cardRef }: OrgCardProps) {
  const border = isSelected
    ? 'border-[#1B3A6B] shadow-md ring-2 ring-[#1B3A6B]/20'
    : isHovered
    ? 'border-gray-300 shadow-sm'
    : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 flex flex-col gap-2.5 cursor-pointer transition-all ${border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-[#1B3A6B] leading-tight min-w-0">{org.name}</h3>
        {org.type && (
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            {org.type}
          </span>
        )}
      </div>

      {org.languages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {org.languages.map((lang) => (
            <span key={lang} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
              {lang}
            </span>
          ))}
        </div>
      )}

      {org.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{org.description}</p>
      )}

      {org.address && (
        <p className="text-xs text-gray-400 flex items-start gap-1">
          <svg className="w-3 h-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{org.address}</span>
        </p>
      )}

      {(org.phone || org.email || org.website) && (
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
          {org.phone && (
            <a
              href={`tel:${org.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-[#1B3A6B]"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {org.phone}
            </a>
          )}
          {org.email && (
            <a
              href={`mailto:${org.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-[#1B3A6B]"
            >
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
              onClick={(e) => e.stopPropagation()}
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
