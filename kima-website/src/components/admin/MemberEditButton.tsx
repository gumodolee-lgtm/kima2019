'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@prisma/client'

interface MemberData {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization: string | null
  position: string | null
  phone: string | null
  address: string | null
  denomination: string | null
  region: string | null
  expiresAt: Date | null
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]'

const REGIONS = ['서울경기인천', '부산경남', '대구경북', '광주전라', '대전충청', '강원제주', '해외']

function toDateInput(d: Date | null): string {
  if (!d) return ''
  return new Date(d).toISOString().slice(0, 10)
}

export function MemberEditButton({ user }: { user: MemberData }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name:         user.name         ?? '',
    organization: user.organization ?? '',
    position:     user.position     ?? '',
    phone:        user.phone        ?? '',
    address:      user.address      ?? '',
    denomination: user.denomination ?? '',
    region:       user.region       ?? '',
    expiresAt:    toDateInput(user.expiresAt),
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function openModal() {
    setForm({
      name:         user.name         ?? '',
      organization: user.organization ?? '',
      position:     user.position     ?? '',
      phone:        user.phone        ?? '',
      address:      user.address      ?? '',
      denomination: user.denomination ?? '',
      region:       user.region       ?? '',
      expiresAt:    toDateInput(user.expiresAt),
    })
    setError('')
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        name:         form.name.trim()         || null,
        organization: form.organization.trim() || null,
        position:     form.position.trim()     || null,
        phone:        form.phone.trim()        || null,
        address:      form.address.trim()      || null,
        denomination: form.denomination.trim() || null,
        region:       form.region              || null,
        expiresAt:    form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      }
      const res = await fetch(`/api/admin/members/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? '저장 실패')
      }
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        정보 수정
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-[#1B3A6B]">회원 정보 수정</h3>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">이름</label>
                  <input
                    maxLength={50}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="홍길동"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">직분</label>
                  <input
                    maxLength={50}
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    placeholder="목사, 선교사, 전도사..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">소속 단체</label>
                <input
                  maxLength={100}
                  value={form.organization}
                  onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                  placeholder="○○교회 / ○○선교회"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">연락처</label>
                  <input
                    maxLength={30}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">교단</label>
                  <input
                    maxLength={100}
                    value={form.denomination}
                    onChange={(e) => setForm((f) => ({ ...f, denomination: e.target.value }))}
                    placeholder="합동, 통합, 고신..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">주소</label>
                <input
                  maxLength={200}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="서울시 강남구..."
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">지역</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                    title="지역"
                    className={inputCls}
                  >
                    <option value="">선택 안함</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    정회원 만료일
                    <span className="text-gray-400 font-normal ml-1">(정회원만 해당)</span>
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    title="정회원 만료일"
                    className={inputCls}
                    disabled={user.role !== 'PREMIUM' && user.role !== 'ADMIN'}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>

            {/* 버튼 */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#15305a] disabled:opacity-50"
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
