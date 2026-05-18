'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface OrgRow {
  id: string
  name: string
  nameEn: string | null
  region: string
  type: string | null
  address: string | null
  phone: string | null
  email: string | null
  isPublic: boolean
  gmfsnsId: number | null
  source: string | null
  createdAt: string
}

interface DuplicateGroup {
  reason: string
  key: string
  orgs: OrgRow[]
}

interface ApiResult {
  groups: DuplicateGroup[]
  totalDuplicateOrgs: number
}

function ResultModal({
  result,
  onClose,
  onDelete,
  deleting,
}: {
  result: ApiResult
  onClose: () => void
  onDelete: (id: string, name: string) => void
  deleting: string | null
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-16 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1B3A6B] rounded-t-2xl shrink-0">
          <div>
            <p className="text-white font-bold">중복 단체 검색 결과</p>
            <p className="text-blue-200 text-xs mt-0.5">
              {result.groups.length > 0
                ? `${result.groups.length}개 그룹 · 총 ${result.totalDuplicateOrgs}개 단체 해당`
                : '중복 단체 없음'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors text-xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">
          {result.groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-green-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base font-semibold text-green-700">중복 단체가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">이름, 전화번호, 이메일 기준으로 확인했습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.groups.map((group, gi) => (
                <div key={gi} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* 그룹 헤더 */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border-b border-orange-100">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-200 text-orange-800 shrink-0">
                      {group.reason}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 truncate">{group.key}</span>
                    <span className="text-xs text-gray-400 shrink-0 ml-auto">{group.orgs.length}개 단체</span>
                  </div>

                  {/* 단체 목록 */}
                  <div className="divide-y divide-gray-50">
                    {group.orgs.map((org) => (
                      <div key={org.id} className="px-4 py-3 flex items-start justify-between gap-3 bg-white hover:bg-gray-50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{org.name}</span>
                            {org.nameEn && (
                              <span className="text-xs text-gray-400">({org.nameEn})</span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              org.isPublic ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {org.isPublic ? '공개' : '대기'}
                            </span>
                            {org.source === 'gmfsns' ? (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 font-medium">GMFSNS</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-600 font-medium">직접등록</span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                            <span className="font-medium text-gray-500">{org.region}</span>
                            {org.type && <span>{org.type}</span>}
                            {org.phone && <span>☎ {org.phone}</span>}
                            {org.email && <span>✉ {org.email}</span>}
                            {org.gmfsnsId != null && <span>GMFSNS #{org.gmfsnsId}</span>}
                          </div>
                          {org.address && (
                            <p className="mt-0.5 text-xs text-gray-400 truncate">📍 {org.address}</p>
                          )}
                        </div>

                        <div className="flex gap-1.5 shrink-0 pt-0.5">
                          <a
                            href={`/network/mission-map/${org.gmfsnsId ?? org.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            상세
                          </a>
                          <button
                            type="button"
                            onClick={() => onDelete(org.id, org.name)}
                            disabled={deleting === org.id}
                            className="px-2.5 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleting === org.id ? '삭제 중…' : '삭제'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 border-t border-gray-100 shrink-0 flex justify-between items-center">
          <p className="text-xs text-gray-400">단체명 · 전화번호 · 이메일 기준으로 중복을 탐지합니다.</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function FindDuplicatesButton() {
  const [state, setState] = useState<'idle' | 'loading'>('idle')
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const run = async () => {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/admin/find-duplicates')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '오류가 발생했습니다.')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setState('idle')
    }
  }

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!confirm(`"${orgName}" 단체를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    setDeleting(orgId)
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제 실패')
      setResult((prev) => {
        if (!prev) return prev
        const groups = prev.groups
          .map((g) => ({ ...g, orgs: g.orgs.filter((o) => o.id !== orgId) }))
          .filter((g) => g.orgs.length >= 2)
        const totalDuplicateOrgs = new Set(groups.flatMap((g) => g.orgs.map((o) => o.id))).size
        return { groups, totalDuplicateOrgs }
      })
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={state === 'loading'}
        className="w-full px-3 py-1.5 rounded-lg border border-orange-300 text-orange-700 text-xs font-medium hover:bg-orange-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        {state === 'loading' ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            분석 중…
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            중복 단체 찾기
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {result && (
        <ResultModal
          result={result}
          onClose={() => setResult(null)}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}
    </>
  )
}
