'use client'

import { useState } from 'react'

export function GeocodeButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const run = async (force = false) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/organizations/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (!res.ok) { setResult(`오류: ${data.error}`); return }
      setResult(`완료 — 전체 ${data.total}건 / 성공 ${data.success}건 / 실패 ${data.failed}건`)
    } catch {
      setResult('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '처리 중…' : '📍 좌표 없는 단체 일괄 설정'}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-gray-500 text-white text-xs font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          전체 재설정
        </button>
      </div>
      {result && (
        <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">{result}</p>
      )}
    </div>
  )
}
