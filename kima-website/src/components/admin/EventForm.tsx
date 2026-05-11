'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function EventForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'LISTENING_CALL',
    scheduledAt: '',
    zoomUrl: '',
    maxAttendees: '',
  })

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
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }
      setForm({ title: '', description: '', type: 'LISTENING_CALL', scheduledAt: '', zoomUrl: '', maxAttendees: '' })
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] transition-colors"
      >
        + 일정 등록
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
      <h3 className="font-semibold text-gray-800">새 일정 등록</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">제목 *</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]" disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">유형</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]" disabled={isPending}>
            <option value="LISTENING_CALL">리스닝콜</option>
            <option value="FORUM">포럼</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">일시 *</label>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]" disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Zoom URL</label>
          <input type="url" value={form.zoomUrl} onChange={(e) => set('zoomUrl', e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]" disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">설명</label>
          <input type="text" value={form.description} onChange={(e) => set('description', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]" disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">최대 참석 인원</label>
          <input type="number" value={form.maxAttendees} onChange={(e) => set('maxAttendees', e.target.value)}
            placeholder="없으면 비워두기"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]" disabled={isPending} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] disabled:opacity-50 transition-colors">
          {isPending ? '등록 중…' : '등록'}
        </button>
        <button onClick={() => { setOpen(false); setError('') }}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
          취소
        </button>
      </div>
    </div>
  )
}
