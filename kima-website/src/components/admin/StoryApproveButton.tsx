'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = { storyId: string; action: 'approve' | 'reject' }

export function StoryApproveButton({ storyId, action }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          ...(action === 'approve' ? { isPublished: true } : {}),
        }),
      })
      router.refresh()
    })
  }

  if (action === 'approve') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '처리 중…' : '승인'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
    >
      {isPending ? '처리 중…' : '반려'}
    </button>
  )
}
