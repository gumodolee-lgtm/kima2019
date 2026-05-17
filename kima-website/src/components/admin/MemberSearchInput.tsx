'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function MemberSearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set('q', value)
    else sp.delete('q')
    sp.delete('page')
    startTransition(() => router.push(`/admin/members?${sp.toString()}`))
  }

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="이름·이메일·소속 검색"
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B]"
      />
    </div>
  )
}
