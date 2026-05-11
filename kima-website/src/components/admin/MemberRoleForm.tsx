'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@prisma/client'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'MEMBER', label: '일반회원' },
  { value: 'PREMIUM', label: '정회원' },
  { value: 'OFFICER', label: '임원' },
  { value: 'ADMIN', label: '관리자' },
]

interface MemberRoleFormProps {
  userId: string
  currentRole: UserRole
  currentNote: string | null
}

export function MemberRoleForm({ userId, currentRole, currentNote }: MemberRoleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<UserRole>(currentRole)
  const [note, setNote] = useState(currentNote ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    setError('')
    setSaved(false)
    startTransition(async () => {
      const res = await fetch(`/api/admin/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, premiumNote: note }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  const dirty = role !== currentRole || note !== (currentNote ?? '')

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={role}
        onChange={(e) => { setRole(e.target.value as UserRole); setSaved(false) }}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
        disabled={isPending}
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false) }}
        placeholder="납부 메모"
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-36 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
        disabled={isPending}
      />

      {dirty && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-xs px-2.5 py-1 rounded-lg bg-[#1B3A6B] text-white disabled:opacity-50 hover:bg-[#142d54] transition-colors"
        >
          {isPending ? '저장 중…' : '저장'}
        </button>
      )}

      {saved && <span className="text-xs text-green-600">저장됨</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
