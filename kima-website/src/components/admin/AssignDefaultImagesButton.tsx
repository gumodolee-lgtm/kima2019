'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AssignDefaultImagesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ assigned?: number; message?: string; error?: string } | null>(null)

  const handleAssign = async () => {
    if (!confirm('이미지가 없는 단체에 기본 교회 이미지(church_1~4)를 순차적으로 할당합니다. 계속하시겠습니까?')) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/assign-default-images', { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        setResult({ assigned: json.assigned, message: json.message })
        router.refresh()
      } else {
        setResult({ error: json.error ?? '처리 중 오류가 발생했습니다.' })
      }
    } catch {
      setResult({ error: '네트워크 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleAssign}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400 transition-colors disabled:opacity-50"
      >
        {loading ? '기본 이미지 할당 중…' : '기본 이미지 일괄 할당'}
      </button>
      {result && (
        <p className={`text-xs ${result.error ? 'text-red-500' : 'text-green-600'}`}>
          {result.error ?? result.message}
        </p>
      )}
    </div>
  )
}
