'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ORG_REGIONS, LANGUAGES, TARGETS, ORG_TYPES } from '@/schemas/organization.schema'

interface FilterBarProps {
  totalCount: number
}

function parseMulti(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}
function serializeMulti(arr: string[]): string {
  return arr.join(',')
}

export function FilterBar({ totalCount }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedRegions = parseMulti(searchParams.get('region'))
  const selectedLangs   = parseMulti(searchParams.get('language'))
  const selectedTargets = parseMulti(searchParams.get('target'))
  const selectedTypes   = parseMulti(searchParams.get('type'))
  const currentQ        = searchParams.get('q') ?? ''

  const [searchInput, setSearchInput] = useState(currentQ)

  useEffect(() => { setSearchInput(currentQ) }, [currentQ])

  const totalSelected = selectedRegions.length + selectedLangs.length + selectedTargets.length + selectedTypes.length

  const updateParam = useCallback(
    (key: string, current: string[], val: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
      if (next.length > 0) {
        params.set(key, serializeMulti(next))
      } else {
        params.delete(key)
      }
      router.push(`/directory?${params.toString()}`)
    },
    [router, searchParams],
  )

  const applySearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) {
      params.set('q', searchInput.trim())
    } else {
      params.delete('q')
    }
    router.push(`/directory?${params.toString()}`)
  }, [router, searchParams, searchInput])

  const clearAll = useCallback(() => {
    setSearchInput('')
    router.push('/directory')
  }, [router])

  const hasAnyFilter = totalSelected > 0 || !!currentQ

  return (
    <div className="space-y-2.5">

      {/* 검색 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') applySearch() }}
          placeholder="단체명 검색..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
        />
        <button
          type="button"
          onClick={applySearch}
          className="px-3 py-1.5 rounded-lg bg-[#1B3A6B] text-white text-xs font-medium hover:bg-[#15305a] transition-colors shrink-0"
        >
          검색
        </button>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
          >
            초기화
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm space-y-2.5">

        {/* 유형 */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-10 pt-0.5 shrink-0">유형</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ORG_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t)}
                  onChange={() => updateParam('type', selectedTypes, t)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B]"
                />
                <span className={`text-sm ${selectedTypes.includes(t) ? 'font-semibold text-[#1B3A6B]' : 'text-gray-700'}`}>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 사역대상 */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-10 pt-0.5 shrink-0">대상</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {TARGETS.map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedTargets.includes(t)}
                  onChange={() => updateParam('target', selectedTargets, t)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B]"
                />
                <span className={`text-sm ${selectedTargets.includes(t) ? 'font-semibold text-[#1B3A6B]' : 'text-gray-700'}`}>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 언어 */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-10 pt-0.5 shrink-0">언어</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {LANGUAGES.map((l) => (
              <label key={l} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedLangs.includes(l)}
                  onChange={() => updateParam('language', selectedLangs, l)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B]"
                />
                <span className={`text-sm ${selectedLangs.includes(l) ? 'font-semibold text-[#1B3A6B]' : 'text-gray-700'}`}>{l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 지역 */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-10 pt-0.5 shrink-0">지역</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ORG_REGIONS.map((r) => (
              <label key={r} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(r)}
                  onChange={() => updateParam('region', selectedRegions, r)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B]"
                />
                <span className={`text-sm ${selectedRegions.includes(r) ? 'font-semibold text-[#1B3A6B]' : 'text-gray-700'}`}>{r}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
