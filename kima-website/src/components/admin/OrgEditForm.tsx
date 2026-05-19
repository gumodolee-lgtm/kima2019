'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ORG_REGIONS, LANGUAGES, TARGETS, ORG_TYPES } from '@/schemas/organization.schema'

interface Org {
  id: string
  name: string
  representative: string | null
  nameEn: string | null
  description: string | null
  region: string
  languages: string[]
  targets: string[]
  type: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  isPublic: boolean
}

export function OrgEditForm({ org }: { org: Org }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: org.name,
    representative: org.representative ?? '',
    nameEn: org.nameEn ?? '',
    description: org.description ?? '',
    region: org.region,
    languages: org.languages,
    targets: org.targets,
    type: org.type ?? '',
    address: org.address ?? '',
    phone: org.phone ?? '',
    email: org.email ?? '',
    website: org.website ?? '',
    isPublic: org.isPublic,
  })

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  const toggleArray = (key: 'languages' | 'targets', value: string) => {
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value],
    }))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('단체명을 입력해주세요.'); return }
    if (form.languages.length === 0) { setError('언어권을 1개 이상 선택해주세요.'); return }
    if (form.targets.length === 0) { setError('사역대상을 1개 이상 선택해주세요.'); return }
    setError('')

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/organizations/${org.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            representative: form.representative || null,
            nameEn: form.nameEn || null,
            description: form.description || null,
            type: form.type || null,
            address: form.address || null,
            phone: form.phone || null,
            email: form.email || null,
            website: form.website || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? '수정에 실패했습니다.')
          return
        }
        setOpen(false)
        router.refresh()
      } catch {
        setError('수정 중 오류가 발생했습니다.')
      }
    })
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        수정
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setOpen(false); setError('') }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h4 className="text-base font-bold text-[#1B3A6B]">단체 정보 수정</h4>
              <button
                type="button"
                onClick={() => { setOpen(false); setError('') }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* 폼 본문 */}
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">단체명 *</label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} disabled={isPending} placeholder="단체명" title="단체명" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">영문명</label>
                  <input type="text" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} className={inputClass} disabled={isPending} placeholder="English name" title="영문명" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">대표 / 담임목사</label>
                <input
                  type="text"
                  value={form.representative}
                  onChange={(e) => set('representative', e.target.value)}
                  className={inputClass}
                  disabled={isPending}
                  placeholder="예: 홍길동 목사"
                  title="대표/담임목사"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">지역 *</label>
                  <select value={form.region} onChange={(e) => set('region', e.target.value)} className={inputClass} disabled={isPending} title="지역">
                    {ORG_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">유형</label>
                  <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputClass} disabled={isPending} title="유형">
                    <option value="">선택 안 함</option>
                    {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">언어권 * (복수 선택 가능)</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {LANGUAGES.map((l) => (
                    <label key={l} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={form.languages.includes(l)} onChange={() => toggleArray('languages', l)} disabled={isPending} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">사역대상 * (복수 선택 가능)</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {TARGETS.map((t) => (
                    <label key={t} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={form.targets.includes(t)} onChange={() => toggleArray('targets', t)} disabled={isPending} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">소개</label>
                <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} resize-none`} disabled={isPending} title="소개" placeholder="단체 소개" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">주소</label>
                <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} disabled={isPending} title="주소" placeholder="주소" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">전화번호</label>
                  <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} disabled={isPending} title="전화번호" placeholder="전화번호" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">이메일</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} disabled={isPending} title="이메일" placeholder="이메일" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">웹사이트</label>
                  <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} className={inputClass} disabled={isPending} title="웹사이트" placeholder="https://" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} disabled={isPending} />
                공개 (지도에 표시)
              </label>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            {/* 하단 버튼 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-2 justify-end rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setOpen(false); setError('') }}
                disabled={isPending}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="px-5 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] disabled:opacity-50 transition-colors"
              >
                {isPending ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
