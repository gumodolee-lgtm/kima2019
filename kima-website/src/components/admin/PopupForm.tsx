'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PopupData {
  id?: string
  title: string
  body: string
  imageUrl: string
  youtubeId: string
  linkUrl: string
  linkLabel: string
  startAt: string
  endAt: string
  isActive: boolean
}

function toLocalDatetime(d: Date | string) {
  const date = new Date(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIso(local: string) {
  return new Date(local).toISOString()
}

const INPUT = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]'
const LABEL = 'block text-xs font-medium text-gray-600 mb-1'

export function PopupForm({ initial, onClose }: { initial?: PopupData; onClose: () => void }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const now = toLocalDatetime(new Date())
  const nextWeek = toLocalDatetime(new Date(Date.now() + 7 * 86400000))

  const [form, setForm] = useState<PopupData>(
    initial ?? {
      title: '',
      body: '',
      imageUrl: '',
      youtubeId: '',
      linkUrl: '',
      linkLabel: '',
      startAt: now,
      endAt: nextWeek,
      isActive: true,
    }
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('upload')

  const set = (key: keyof PopupData, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/popups/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '업로드 실패'); return }
      set('imageUrl', data.url)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!form.startAt || !form.endAt) { setError('게시 기간을 설정해주세요.'); return }
    if (new Date(form.startAt) >= new Date(form.endAt)) { setError('종료일은 시작일보다 이후여야 합니다.'); return }

    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl || null,
        youtubeId: form.youtubeId || null,
        linkUrl: form.linkUrl || null,
        linkLabel: form.linkLabel || null,
        body: form.body || null,
        startAt: toIso(form.startAt),
        endAt: toIso(form.endAt),
      }
      const url = form.id ? `/api/admin/popups/${form.id}` : '/api/admin/popups'
      const method = form.id ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '저장 실패')
        return
      }
      router.refresh()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 제목 */}
      <div>
        <label className={LABEL}>팝업 제목 *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className={INPUT}
          placeholder="팝업 제목"
        />
      </div>

      {/* 본문 텍스트 */}
      <div>
        <label className={LABEL}>본문 텍스트</label>
        <textarea
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          className={`${INPUT} h-24 resize-none`}
          placeholder="팝업에 표시할 내용을 입력하세요"
        />
      </div>

      {/* 이미지 */}
      <div>
        <label className={LABEL}>이미지</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setImageTab('upload')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${imageTab === 'upload' ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'text-gray-500 border-gray-300'}`}
          >
            파일 업로드
          </button>
          <button
            type="button"
            onClick={() => setImageTab('url')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${imageTab === 'url' ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'text-gray-500 border-gray-300'}`}
          >
            URL 직접 입력
          </button>
        </div>

        {imageTab === 'upload' ? (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1B3A6B] transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) handleFileUpload(file)
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
            />
            {uploading ? (
              <p className="text-sm text-gray-500 py-10">업로드 중...</p>
            ) : form.imageUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="preview" className="w-full max-h-96 rounded-lg object-contain" />
                <p className="text-xs text-green-600">업로드 완료 — 클릭하여 교체</p>
              </div>
            ) : (
              <div className="py-6">
                <p className="text-sm text-gray-500">이미지를 드래그하거나 클릭하여 업로드</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF · 최대 5MB</p>
              </div>
            )}
          </div>
        ) : (
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            className={INPUT}
            placeholder="https://example.com/image.jpg"
          />
        )}
      </div>

      {/* 유튜브 */}
      <div>
        <label className={LABEL}>유튜브 영상 ID</label>
        <input
          type="text"
          value={form.youtubeId}
          onChange={(e) => set('youtubeId', e.target.value)}
          className={INPUT}
          placeholder="예) dQw4w9WgXcQ (유튜브 URL의 v= 뒤 값)"
        />
        <p className="text-xs text-gray-400 mt-1">이미지와 유튜브를 모두 설정하면 유튜브가 우선 표시됩니다.</p>
      </div>

      {/* 외부 링크 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>외부 링크 URL</label>
          <input
            type="url"
            value={form.linkUrl}
            onChange={(e) => set('linkUrl', e.target.value)}
            className={INPUT}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className={LABEL}>링크 버튼 텍스트</label>
          <input
            type="text"
            value={form.linkLabel}
            onChange={(e) => set('linkLabel', e.target.value)}
            className={INPUT}
            placeholder="예) 자세히 보기"
          />
        </div>
      </div>

      {/* 게시 기간 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>게시 시작일시 *</label>
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => set('startAt', e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>게시 종료일시 *</label>
          <input
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => set('endAt', e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      {/* 활성 여부 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set('isActive', !form.isActive)}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-[#1B3A6B]' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
        </button>
        <span className="text-sm text-gray-700">{form.isActive ? '활성 (홈페이지에 표시)' : '비활성 (숨김)'}</span>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="px-5 py-2 text-sm bg-[#1B3A6B] text-white rounded-lg hover:bg-[#142d54] disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : form.id ? '수정 저장' : '팝업 등록'}
        </button>
      </div>
    </div>
  )
}
