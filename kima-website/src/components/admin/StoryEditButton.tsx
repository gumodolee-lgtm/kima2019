'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type StoryType = 'NEWS' | 'FIELD_STORY' | 'EVENT_MEDIA' | 'EVENT_PROMO' | 'PRAYER_REQUEST'

interface StoryEditProps {
  story: {
    id: string
    type: StoryType
    title: string
    content: string
    excerpt: string | null
    linkUrl: string | null
    source: string | null
    publishedAt: Date | null
    eventLocation: string | null
    ministryLocation: string | null
    videoUrls: string[]
    tags: string[]
    isPublished: boolean
  }
}

export function StoryEditButton({ story }: StoryEditProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: story.title,
    content: story.content,
    excerpt: story.excerpt ?? '',
    linkUrl: story.linkUrl ?? '',
    source: story.source ?? '',
    publishedAt: story.publishedAt
      ? new Date(story.publishedAt).toISOString().split('T')[0]
      : '',
    eventLocation: story.eventLocation ?? '',
    ministryLocation: story.ministryLocation ?? '',
    videoUrls: story.videoUrls.join('\n'),
    tags: story.tags.join(', '),
    isPublished: story.isPublished,
  })

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!form.content.trim()) { setError('내용을 입력해주세요.'); return }
    setError('')

    startTransition(async () => {
      const res = await fetch(`/api/stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:            form.title.trim(),
          content:          form.content.trim(),
          excerpt:          form.excerpt.trim() || null,
          linkUrl:          form.linkUrl.trim() || null,
          source:           form.source.trim() || null,
          publishedAt:      form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
          eventLocation:    form.eventLocation.trim() || null,
          ministryLocation: form.ministryLocation.trim() || null,
          videoUrls:        form.videoUrls.split('\n').map((v) => v.trim()).filter(Boolean),
          tags:             form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          isPublished:      form.isPublished,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '수정에 실패했습니다.')
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  const ic = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] disabled:opacity-60'

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
      >
        수정
      </button>
    )
  }

  return (
    <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">스토리 수정</h4>

      <div>
        <label className="block text-xs text-gray-500 mb-1">제목 *</label>
        <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
          className={ic} disabled={isPending} />
      </div>

      {story.type === 'NEWS' && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">뉴스 링크 URL</label>
            <input type="text" value={form.linkUrl} onChange={(e) => set('linkUrl', e.target.value)}
              placeholder="https://..." className={ic} disabled={isPending} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">출처</label>
              <input type="text" value={form.source} onChange={(e) => set('source', e.target.value)}
                className={ic} disabled={isPending} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">발행일</label>
              <input type="date" value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)}
                className={ic} disabled={isPending} />
            </div>
          </div>
        </>
      )}

      {story.type === 'EVENT_MEDIA' && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">행사 날짜</label>
            <input type="date" value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)}
              className={ic} disabled={isPending} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">장소</label>
            <input type="text" value={form.eventLocation} onChange={(e) => set('eventLocation', e.target.value)}
              className={ic} disabled={isPending} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">동영상 링크 (줄바꿈으로 구분)</label>
            <textarea value={form.videoUrls} onChange={(e) => set('videoUrls', e.target.value)}
              rows={2} className={`${ic} resize-none`} disabled={isPending} />
          </div>
        </>
      )}

      {story.type === 'FIELD_STORY' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">사역 지역/단체</label>
          <input type="text" value={form.ministryLocation} onChange={(e) => set('ministryLocation', e.target.value)}
            className={ic} disabled={isPending} />
        </div>
      )}

      {story.type === 'EVENT_PROMO' && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">행사 장소</label>
            <input type="text" title="행사 장소" value={form.eventLocation} onChange={(e) => set('eventLocation', e.target.value)}
              className={ic} disabled={isPending} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">동영상 링크 (줄바꿈으로 구분)</label>
            <textarea title="동영상 링크" value={form.videoUrls} onChange={(e) => set('videoUrls', e.target.value)}
              rows={2} className={`${ic} resize-none`} disabled={isPending} />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-1">내용 *</label>
        <textarea value={form.content} onChange={(e) => set('content', e.target.value)}
          rows={5} className={`${ic} resize-y`} disabled={isPending} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">한줄 요약</label>
        <input type="text" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)}
          className={ic} disabled={isPending} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">태그 (쉼표로 구분)</label>
        <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)}
          placeholder="예: 이주민, 선교, 2024" className={ic} disabled={isPending} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isPublished}
          onChange={(e) => set('isPublished', e.target.checked)} disabled={isPending} />
        <span className="text-xs text-gray-600">공개</span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#142d54] disabled:opacity-50 transition-colors">
          {isPending ? '저장 중…' : '저장'}
        </button>
        <button type="button" onClick={() => { setOpen(false); setError('') }} disabled={isPending}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
          취소
        </button>
      </div>
    </div>
  )
}
