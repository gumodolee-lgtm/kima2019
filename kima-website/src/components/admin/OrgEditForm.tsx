'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ORG_REGIONS, LANGUAGES, TARGETS, ORG_TYPES } from '@/schemas/organization.schema'

interface Org {
  id: string
  name: string
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        수정
      </button>
    )
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]'

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">단체 정보 수정</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">단체명 *</label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">영문명</label>
          <input type="text" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} className={inputClass} disabled={isPending} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">지역 *</label>
          <select value={form.region} onChange={(e) => set('region', e.target.value)} className={inputClass} disabled={isPending}>
            {ORG_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">유형</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputClass} disabled={isPending}>
            <option value="">선택 안 함</option>
            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">언어권 * (복수 선택 가능)</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {LANGUAGES.map((l) => (
            <label key={l} className="flex items-center gap-1.5 text-xs cursor-pointer">
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
            <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={form.targets.includes(t)} onChange={() => toggleArray('targets', t)} disabled={isPending} />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">소개</label>
        <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} resize-none`} disabled={isPending} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">주소</label>
        <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} disabled={isPending} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">전화번호</label>
          <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">이메일</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">웹사이트</label>
          <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} className={inputClass} disabled={isPending} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} disabled={isPending} />
        공개 (지도에 표시)
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-1.5 rounded-lg bg-[#1B3A6B] text-white text-xs font-medium hover:bg-[#142d54] disabled:opacity-50 transition-colors"
        >
          {isPending ? '저장 중…' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError('') }}
          disabled={isPending}
          className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
