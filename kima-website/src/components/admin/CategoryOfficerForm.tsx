'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryOfficerFormProps {
  categoryId: string
  officerName: string | null
  officerPhone: string | null
  officerEmail: string | null
  officerSns: string | null
  officerQr: string | null
}

type MemberResult = {
  id: string
  name: string | null
  email: string
  organization: string | null
  position: string | null
  phone: string | null
}

export function CategoryOfficerForm({
  categoryId,
  officerName,
  officerPhone,
  officerEmail,
  officerSns,
  officerQr,
}: CategoryOfficerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName]   = useState(officerName ?? '')
  const [phone, setPhone] = useState(officerPhone ?? '')
  const [email, setEmail] = useState(officerEmail ?? '')
  const [sns, setSns]     = useState(officerSns ?? '')
  const [qr, setQr]       = useState(officerQr ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen]   = useState(false)

  // 회원 검색 상태
  const [memberQuery, setMemberQuery]     = useState('')
  const [memberResults, setMemberResults] = useState<MemberResult[]>([])
  const [searchingMembers, setSearchingMembers] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function searchMembers(q: string) {
    if (!q.trim()) { setMemberResults([]); return }
    setSearchingMembers(true)
    try {
      const res = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setMemberResults(data.users ?? [])
      }
    } finally {
      setSearchingMembers(false)
    }
  }

  function onMemberQueryChange(q: string) {
    setMemberQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchMembers(q), 300)
  }

  function applyMember(m: MemberResult) {
    if (m.name)  { setName(m.name);   setSaved(false) }
    if (m.phone) { setPhone(m.phone); setSaved(false) }
    if (m.email) { setEmail(m.email); setSaved(false) }
    setMemberQuery('')
    setMemberResults([])
  }

  function handleOpen() {
    setOpen((v) => {
      if (v) {
        setMemberQuery('')
        setMemberResults([])
      }
      return !v
    })
  }

  const handleSave = () => {
    setError('')
    setSaved(false)
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName:  name  || null,
          officerPhone: phone || null,
          officerEmail: email || null,
          officerSns:   sns   || null,
          officerQr:    qr    || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }
      setSaved(true)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          {officerName ? (
            <span className="font-medium">{officerName}</span>
          ) : (
            <span className="text-gray-400">담당자 미지정</span>
          )}
          {officerPhone && <span className="ml-2 text-xs text-gray-400">{officerPhone}</span>}
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {open ? '닫기' : '편집'}
        </button>
      </div>

      {open && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          {/* 회원 검색으로 자동 입력 */}
          <div className="border border-blue-100 rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-semibold text-[#1B3A6B] mb-2">회원에서 불러오기</p>
            <input
              type="text"
              value={memberQuery}
              onChange={(e) => onMemberQueryChange(e.target.value)}
              placeholder="이름 · 이메일 · 소속으로 검색"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] bg-white"
              disabled={isPending}
            />
            {searchingMembers && (
              <p className="text-xs text-gray-400 mt-1">검색 중...</p>
            )}
            {memberResults.length > 0 && (
              <ul className="mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto divide-y divide-gray-50">
                {memberResults.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => applyMember(m)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {m.name ?? '(이름 없음)'}
                        {m.position && <span className="ml-1 text-xs text-gray-400">{m.position}</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m.email}{m.organization ? ` · ${m.organization}` : ''}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!searchingMembers && memberQuery && memberResults.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">검색 결과가 없습니다.</p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">선택하면 이름·연락처·이메일이 자동으로 입력됩니다.</p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">위원장 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false) }}
              placeholder="예) 홍길동"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">핸드폰 번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSaved(false) }}
              placeholder="010-0000-0000"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSaved(false) }}
              placeholder="example@email.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">SNS 아이디 (카카오톡 등)</label>
            <input
              type="text"
              value={sns}
              onChange={(e) => { setSns(e.target.value); setSaved(false) }}
              placeholder="카카오톡 오픈채팅 링크 또는 아이디"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">QR코드 이미지 URL</label>
            <input
              type="url"
              value={qr}
              onChange={(e) => { setQr(e.target.value); setSaved(false) }}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              disabled={isPending}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="text-sm px-4 py-1.5 rounded-lg bg-[#1B3A6B] text-white hover:bg-[#142d54] disabled:opacity-50 transition-colors"
            >
              {isPending ? '저장 중…' : '저장'}
            </button>
            {saved && <span className="text-xs text-green-600">저장됨</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
