'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const EMPTY = {
  title: '',
  content: '',
  type: 'TEXT' as 'TEXT' | 'VIDEO',
  videoUrl: '',
  thumbnail: '',
}

export function StoryForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)

  const set = <K extends keyof typeof EMPTY>(k: K, v: typeof EMPTY[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!form.content.trim()) { setError('내용을 입력해주세요.'); return }
    if (form.type === 'VIDEO' && !form.videoUrl.trim()) { setError('영상자료는 영상 URL이 필요합니다.'); return }
    setError('')

    startTransition(async () => {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:    form.title,
          content:  form.content,
          type:     form.type,
          videoUrl: form.videoUrl || undefined,
          thumbnail: form.thumbnail || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }
      setForm(EMPTY)
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
        + 스토리 등록
      </button>
    )
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
      <h3 className="font-semibold text-gray-800">새 스토리 등록</h3>

      {/* 유형 선택 */}
      <div className="flex gap-3">
        {(['TEXT', 'VIDEO'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
              form.type === t
                ? t === 'VIDEO'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'TEXT' ? '📝 일반자료' : '▶ 영상자료'}
          </button>
        ))}
      </div>

      {/* 제목 */}
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

      {/* 영상 URL (VIDEO 전용) */}
      {form.type === 'VIDEO' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">영상 URL * <span className="text-gray-400 font-normal">(YouTube / Vimeo)</span></label>
          <input
            title="영상 URL"
            type="url"
            value={form.videoUrl}
            onChange={(e) => set('videoUrl', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
            disabled={isPending}
          />
        </div>
      )}

      {/* 내용 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">내용 *</label>
        <textarea
          title="내용"
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          rows={6}
          className={`${inputClass} resize-y`}
          disabled={isPending}
          placeholder={form.type === 'VIDEO' ? '영상에 대한 설명을 입력해주세요.' : '스토리 내용을 입력해주세요.'}
        />
      </div>

      {/* 썸네일 URL (선택) */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          썸네일 이미지 URL <span className="text-gray-400 font-normal">(선택 — YouTube는 자동 추출)</span>
        </label>
        <input
          title="썸네일 URL"
          type="url"
          value={form.thumbnail}
          onChange={(e) => set('thumbnail', e.target.value)}
          placeholder="https://..."
          className={inputClass}
          disabled={isPending}
        />
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
