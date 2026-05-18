'use client'

import { useState } from 'react'

export function NormalizeAddressButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/normalize-addresses', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setResult(`오류: ${data.error}`); return }
      setResult(`완료 — 전체 ${data.total}건 / 수정 ${data.updated}건 / 건너뜀 ${data.skipped}건 / 실패 ${data.failed}건`)
    } catch {
      setResult('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '처리 중…' : '🗺️ 주소 → 지역 자동 정규화'}
      </button>
      {result && (
        <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">{result}</p>
      )}
    </div>
  )
}
