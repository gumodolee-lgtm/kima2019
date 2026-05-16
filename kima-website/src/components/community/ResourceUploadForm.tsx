'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const FILE_TYPES = ['PDF', 'PPT', 'DOC', 'XLS', 'ETC'] as const

interface ResourceUploadFormProps {
  categoryId: string
  categoryName: string
}

export function ResourceUploadForm({ categoryId, categoryName }: ResourceUploadFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    driveUrl: '',
    fileType: 'PDF' as string,
    accessLevel: 'MEMBER' as string,
  })

  const set = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!form.driveUrl.trim()) { setError('구글 드라이브 URL을 입력해주세요.'); return }
    if (!form.driveUrl.includes('drive.google.com')) {
      setError('구글 드라이브 링크만 등록 가능합니다 (drive.google.com)'); return
    }
    setError('')

    startTransition(async () => {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          driveUrl: form.driveUrl.trim(),
          fileType: form.fileType,
          accessLevel: form.accessLevel,
          categoryId,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }
      setSuccess('자료가 등록되었습니다!')
      setForm({ title: '', description: '', driveUrl: '', fileType: 'PDF', accessLevel: 'MEMBER' })
      setTimeout(() => { setSuccess(''); setOpen(false) }, 1500)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[#1B3A6B] font-medium hover:underline"
      >
        + 자료 등록
      </button>
    )
  }

  return (
    <div className="mt-4 border border-[#1B3A6B]/20 rounded-xl p-4 bg-blue-50/50 space-y-3">
      <p className="text-xs font-semibold text-[#1B3A6B]">자료 등록 — {categoryName}</p>

      <div>
        <label className="block text-xs text-gray-500 mb-1">제목 *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="자료 제목"
          disabled={isPending}
          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] bg-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">구글 드라이브 URL *</label>
        <input
          type="url"
          value={form.driveUrl}
          onChange={(e) => set('driveUrl', e.target.value)}
          placeholder="https://drive.google.com/..."
          disabled={isPending}
          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] bg-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">설명 (선택)</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="간단한 설명"
          disabled={isPending}
          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">파일 형식</label>
          <select
            value={form.fileType}
            onChange={(e) => set('fileType', e.target.value)}
            disabled={isPending}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
          >
            {FILE_TYPES.map((ft) => <option key={ft}>{ft}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">접근 등급</label>
          <select
            value={form.accessLevel}
            onChange={(e) => set('accessLevel', e.target.value)}
            disabled={isPending}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
          >
            <option value="PUBLIC">공개</option>
            <option value="MEMBER">회원</option>
            <option value="PREMIUM">정회원</option>
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600 font-medium">{success}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-[#1B3A6B] text-white text-xs font-medium hover:bg-[#142d54] disabled:opacity-50 transition-colors"
        >
          {isPending ? '등록 중…' : '등록'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError('') }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
