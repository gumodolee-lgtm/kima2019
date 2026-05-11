'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryOfficerFormProps {
  categoryId: string
  officerName: string | null
  officerSns: string | null
  officerQr: string | null
}

export function CategoryOfficerForm({
  categoryId,
  officerName,
  officerSns,
  officerQr,
}: CategoryOfficerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(officerName ?? '')
  const [sns, setSns] = useState(officerSns ?? '')
  const [qr, setQr] = useState(officerQr ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    setError('')
    setSaved(false)
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName: name || null, officerSns: sns || null, officerQr: qr || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }
      setSaved(true)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          {officerName ? (
            <span className="font-medium">{officerName}</span>
          ) : (
            <span className="text-gray-400">담당자 미지정</span>
          )}
          {officerSns && <span className="ml-2 text-xs text-gray-400">@{officerSns}</span>}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {open ? '닫기' : '편집'}
        </button>
      </div>

      {open && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">위원장 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false) }}
              placeholder="예) 홍길동 위원장"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">SNS 아이디 (카카오톡 등)</label>
            <input
              type="text"
              value={sns}
              onChange={(e) => { setSns(e.target.value); setSaved(false) }}
              placeholder="카카오톡 오픈채팅 링크 또는 아이디"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">QR코드 이미지 URL</label>
            <input
              type="url"
              value={qr}
              onChange={(e) => { setQr(e.target.value); setSaved(false) }}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-sm px-4 py-1.5 rounded-lg bg-[#1B3A6B] text-white hover:bg-[#142d54] disabled:opacity-50 transition-colors"
            >
              {isPending ? '저장 중…' : '저장'}
            </button>
            {saved && <span className="text-xs text-green-600">저장됨</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
