'use client'

import { useState } from 'react'

export function ImportGmfsnsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported?: number; failed?: number; error?: string } | null>(null)

  const handleImport = async () => {
    if (!confirm('GMFSNS JSON 데이터를 Prisma DB로 가져옵니다. 기존 GMFSNS 단체는 덮어쓰여집니다. 계속하시겠습니까?')) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/import-gmfsns', { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        setResult({ imported: json.imported, failed: json.failed })
      } else {
        setResult({ error: json.error ?? '가져오기 중 오류가 발생했습니다.' })
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
        onClick={handleImport}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50"
      >
        {loading ? 'GMFSNS 가져오는 중…' : 'GMFSNS JSON 가져오기'}
      </button>
      {result && (
        <p className={`text-xs ${result.error ? 'text-red-500' : 'text-green-600'}`}>
          {result.error
            ? result.error
            : `완료: ${result.imported}개 가져옴${result.failed ? `, ${result.failed}개 실패` : ''}`}
        </p>
      )}
    </div>
  )
}
