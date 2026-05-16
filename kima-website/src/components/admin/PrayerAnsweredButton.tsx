'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = { storyId: string; isAnswered: boolean }

export function PrayerAnsweredButton({ storyId, isAnswered }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAnswered: !isAnswered }),
      })
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
        isAnswered
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {isPending ? '처리 중…' : isAnswered ? '✓ 응답됨' : '응답됨으로 표시'}
    </button>
  )
}
