'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { EVENT_TYPES } from '@/lib/eventTypes'

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'LISTENING_CALL',
  scheduledAt: '',
  zoomUrl: '',
  location: '',
  maxAttendees: '',
}

export function EventForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const set = (k: keyof typeof form, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim() || !form.scheduledAt) {
      setError('제목과 일시는 필수입니다.')
      return
    }
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          type: form.type,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          zoomUrl: form.zoomUrl || undefined,
          location: form.location || undefined,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }
      setForm(EMPTY_FORM)
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] transition-colors mb-6"
      >
        + 일정 등록
      </button>
    )
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
      <h3 className="font-semibold text-gray-800">새 일정 등록</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">제목 *</label>
          <input
            title="제목"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputClass}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">유형</label>
          <select
            title="유형"
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            className={inputClass}
            disabled={isPending}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">일시 *</label>
          <input
            title="일시"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set('scheduledAt', e.target.value)}
            className={inputClass}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">장소</label>
          <input
            title="장소"
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="예: 오륜교회 그레이스홀"
            className={inputClass}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Zoom URL</label>
          <input
            title="Zoom URL"
            type="url"
            value={form.zoomUrl}
            onChange={(e) => set('zoomUrl', e.target.value)}
            placeholder="https://zoom.us/j/..."
            className={inputClass}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">설명</label>
          <input
            title="설명"
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputClass}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">최대 참석 인원</label>
          <input
            title="최대 참석 인원"
            type="number"
            value={form.maxAttendees}
            onChange={(e) => set('maxAttendees', e.target.value)}
            placeholder="없으면 비워두기"
            className={inputClass}
            disabled={isPending}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] disabled:opacity-50 transition-colors"
        >
          {isPending ? '등록 중…' : '등록'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError('') }}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
