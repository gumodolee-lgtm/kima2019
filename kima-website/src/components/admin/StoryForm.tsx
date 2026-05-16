'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type StoryType = 'NEWS' | 'EVENT_MEDIA'

const EMPTY = {
  type: 'NEWS' as StoryType,
  title: '',
  content: '',
  excerpt: '',
  linkUrl: '',
  source: '',
  publishedAt: '',
  eventLocation: '',
  videoUrls: '',
  tags: '',
}

const TYPE_LABELS: Record<StoryType, string> = {
  NEWS:        '📰 KIMA 뉴스',
  EVENT_MEDIA: '📸 행사 사진&영상',
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
    if (form.type === 'NEWS' && !form.linkUrl.trim()) { setError('뉴스 링크 URL을 입력해주세요.'); return }
    setError('')

    startTransition(async () => {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:        form.type,
          title:       form.title,
          content:     form.content,
          excerpt:     form.excerpt || undefined,
          linkUrl:       form.linkUrl || undefined,
          source:        form.source || undefined,
          publishedAt:   form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
          eventLocation: form.eventLocation || undefined,
          videoUrls:     form.videoUrls.split('\n').map((v) => v.trim()).filter(Boolean),
          tags:        form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          status:      'APPROVED',
          isPublished: true,
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

      <div className="flex gap-3">
        {(Object.keys(TYPE_LABELS) as StoryType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
              form.type === t
                ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

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

      {form.type === 'NEWS' && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">뉴스 링크 URL *</label>
            <input
              title="뉴스 링크 URL"
              type="url"
              value={form.linkUrl}
              onChange={(e) => set('linkUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">출처 (선택)</label>
              <input
                title="출처"
                type="text"
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
                placeholder="예: 기독일보"
                className={inputClass}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">발행일 (선택)</label>
              <input
                title="발행일"
                type="date"
                value={form.publishedAt}
                onChange={(e) => set('publishedAt', e.target.value)}
                className={inputClass}
                disabled={isPending}
              />
            </div>
          </div>
        </>
      )}

      {form.type === 'EVENT_MEDIA' && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">장소 (선택)</label>
            <input
              title="장소"
              type="text"
              value={form.eventLocation}
              onChange={(e) => set('eventLocation', e.target.value)}
              placeholder="예: 서울 강남구 OO교회"
              className={inputClass}
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">동영상 링크 (선택, 줄바꿈으로 구분)</label>
            <textarea
              title="동영상 링크"
              value={form.videoUrls}
              onChange={(e) => set('videoUrls', e.target.value)}
              rows={3}
              placeholder="https://youtube.com/..."
              className={`${inputClass} resize-none`}
              disabled={isPending}
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-1">내용 / 설명 *</label>
        <textarea
          title="내용"
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          rows={5}
          className={`${inputClass} resize-y`}
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">한줄 요약 (선택)</label>
        <input
          title="한줄 요약"
          type="text"
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          placeholder="목록에 표시될 짧은 설명"
          className={inputClass}
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">태그 (선택, 쉼표로 구분)</label>
        <input
          title="태그"
          type="text"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder="예: 이주민, 선교, 2024"
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
