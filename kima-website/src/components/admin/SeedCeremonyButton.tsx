'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function SeedCeremonyButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')

  const handleSeed = () => {
    startTransition(async () => {
      const res = await fetch('/api/admin/seed-ceremony', { method: 'POST' })
      const data = await res.json()
      setMsg(data.message ?? data.error ?? (res.ok ? '완료' : '오류 발생'))
      if (res.ok) router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleSeed}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-medium hover:bg-amber-100 disabled:opacity-50 transition-colors"
      >
        {isPending ? '등록 중…' : '📷 4기 이취임식 갤러리 등록'}
      </button>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  )
}
