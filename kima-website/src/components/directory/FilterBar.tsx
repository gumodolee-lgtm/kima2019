'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { ORG_REGIONS, LANGUAGES, TARGETS, ORG_TYPES } from '@/schemas/organization.schema'

interface FilterBarProps {
  totalCount: number
}

export function FilterBar({ totalCount }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/directory?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = useCallback(() => {
    router.push('/directory')
  }, [router])

  const hasFilter =
    searchParams.get('region') ||
    searchParams.get('language') ||
    searchParams.get('target') ||
    searchParams.get('type')

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[#1B3A6B] shrink-0">필터</span>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          value={searchParams.get('region') ?? ''}
          onChange={(e) => setFilter('region', e.target.value)}
        >
          <option value="">지역 전체</option>
          {ORG_REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          value={searchParams.get('language') ?? ''}
          onChange={(e) => setFilter('language', e.target.value)}
        >
          <option value="">언어권 전체</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          value={searchParams.get('target') ?? ''}
          onChange={(e) => setFilter('target', e.target.value)}
        >
          <option value="">사역대상 전체</option>
          {TARGETS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          value={searchParams.get('type') ?? ''}
          onChange={(e) => setFilter('type', e.target.value)}
        >
          <option value="">유형 전체</option>
          {ORG_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium underline"
          >
            초기화
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400 shrink-0">
          {totalCount}개 단체
        </span>
      </div>
    </div>
  )
}
