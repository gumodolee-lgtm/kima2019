'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orgId: string
  orgName: string
}

export function DeleteOrgButton({ orgId, orgName }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      } else {
        const json = await res.json()
        alert(json.error ?? '삭제 중 오류가 발생했습니다.')
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-red-600 font-medium truncate max-w-[120px]">{orgName} 삭제?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-0.5 rounded text-xs bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '삭제 중…' : '확인'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-2 py-0.5 rounded text-xs border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
    >
      삭제
    </button>
  )
}
