'use client'

import { useEffect } from 'react'

export default function StoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin/stories] error:', error)
  }, [error])

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
      <p className="text-sm font-semibold text-red-700">페이지를 불러오는 중 오류가 발생했습니다.</p>
      <p className="text-xs text-red-500">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
