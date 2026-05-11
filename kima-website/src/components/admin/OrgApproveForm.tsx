'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface OrgApproveFormProps {
  orgId: string
  orgName: string
}

export function OrgApproveForm({ orgId, orgName }: OrgApproveFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [error, setError] = useState('')

  const handleAction = (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectReason.trim()) {
      setError('반려 사유를 입력해주세요.')
      return
    }
    setError('')
    startTransition(async () => {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectReason: action === 'reject' ? rejectReason : undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '처리에 실패했습니다.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {!showReject ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('approve')}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? '처리 중…' : '승인'}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            반려
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => { setRejectReason(e.target.value); setError('') }}
            placeholder="반려 사유 입력"
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 w-48"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('reject')}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? '처리 중…' : '반려 확인'}
            </button>
            <button
              onClick={() => { setShowReject(false); setError('') }}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
