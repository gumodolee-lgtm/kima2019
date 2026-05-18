'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import { ORG_REGIONS, LANGUAGES, TARGETS, ORG_TYPES } from '@/schemas/organization.schema'

interface FilterBarProps {
  totalCount: number
}

// 콤마 구분 파라미터 파싱/직렬화
function parseMulti(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}
function serializeMulti(arr: string[]): string {
  return arr.join(',')
}

// 개별 필터 드롭다운 컴포넌트
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  single = false,
}: {
  label: string
  options: readonly string[]
  selected: string[]
  onToggle: (val: string) => void
  single?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const count = selected.length
  const active = count > 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap
          ${active
            ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
          }`}
      >
        {label}
        {active && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold">
            {count}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[160px] max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const checked = selected.includes(opt)
            return (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-blue-50 select-none"
              >
                <input
                  type={single ? 'radio' : 'checkbox'}
                  checked={checked}
                  onChange={() => onToggle(opt)}
                  className="w-3.5 h-3.5 accent-[#1B3A6B] shrink-0"
                />
                <span className={`text-sm ${checked ? 'font-semibold text-[#1B3A6B]' : 'text-gray-700'}`}>
                  {opt}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function FilterBar({ totalCount }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedRegions  = parseMulti(searchParams.get('region'))
  const selectedLangs    = parseMulti(searchParams.get('language'))
  const selectedTargets  = parseMulti(searchParams.get('target'))
  const selectedTypes    = parseMulti(searchParams.get('type'))

  const totalSelected = selectedRegions.length + selectedLangs.length + selectedTargets.length + selectedTypes.length

  const updateParam = useCallback(
    (key: string, current: string[], val: string, single = false) => {
      const params = new URLSearchParams(searchParams.toString())
      let next: string[]
      if (single) {
        next = current.includes(val) ? [] : [val]
      } else {
        next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
      }
      if (next.length > 0) {
        params.set(key, serializeMulti(next))
      } else {
        params.delete(key)
      }
      router.push(`/directory?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearAll = useCallback(() => router.push('/directory'), [router])

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">

        <FilterDropdown
          label="지역"
          options={ORG_REGIONS}
          selected={selectedRegions}
          onToggle={(v) => updateParam('region', selectedRegions, v)}
        />

        <FilterDropdown
          label="언어권"
          options={LANGUAGES}
          selected={selectedLangs}
          onToggle={(v) => updateParam('language', selectedLangs, v)}
        />

        <FilterDropdown
          label="사역대상"
          options={TARGETS}
          selected={selectedTargets}
          onToggle={(v) => updateParam('target', selectedTargets, v)}
        />

        <FilterDropdown
          label="유형"
          options={ORG_TYPES}
          selected={selectedTypes}
          onToggle={(v) => updateParam('type', selectedTypes, v)}
        />

        {totalSelected > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium underline whitespace-nowrap"
          >
            초기화
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400 shrink-0 whitespace-nowrap">
          {totalCount}개 단체
        </span>
      </div>

      {/* 선택된 필터 태그 */}
      {totalSelected > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
          {[
            ...selectedRegions.map((v) => ({ key: 'region', val: v, arr: selectedRegions })),
            ...selectedLangs.map((v) => ({ key: 'language', val: v, arr: selectedLangs })),
            ...selectedTargets.map((v) => ({ key: 'target', val: v, arr: selectedTargets })),
            ...selectedTypes.map((v) => ({ key: 'type', val: v, arr: selectedTypes })),
          ].map(({ key, val, arr }) => (
            <span
              key={`${key}-${val}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
            >
              {val}
              <button
                type="button"
                onClick={() => updateParam(key, arr, val)}
                className="hover:text-red-500 transition-colors"
                aria-label={`${val} 제거`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
