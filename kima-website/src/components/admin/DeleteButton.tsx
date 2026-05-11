'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  url: string
  label?: string
  confirmText?: string
}

export function DeleteButton({ url, label = '삭제', confirmText = '정말 삭제하시겠습니까?' }: DeleteButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(url, { method: 'DELETE' })
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
        >
          {isPending ? '삭제 중…' : '확인'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
    >
      {label}
    </button>
  )
}
