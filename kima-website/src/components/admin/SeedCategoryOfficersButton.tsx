'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function SeedCategoryOfficersButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState('')

  const handleSeed = () => {
    if (!confirm('4기 조직도 기준으로 카테고리 담당 위원장 정보를 일괄 등록합니다.\n기존 정보가 덮어쓰여집니다. 계속하시겠습니까?')) return
    setResult('')
    startTransition(async () => {
      const res = await fetch('/api/admin/seed-category-officers', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setResult(`오류: ${data.error}`)
        return
      }
      setResult(`${data.updated}개 카테고리 업데이트 완료`)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSeed}
        disabled={isPending}
        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {isPending ? '등록 중…' : '📋 4기 위원장 일괄 등록'}
      </button>
      {result && <span className="text-xs text-green-600">{result}</span>}
    </div>
  )
}
