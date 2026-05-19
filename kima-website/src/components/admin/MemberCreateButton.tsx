'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]'

const REGIONS = ['서울경기인천', '부산경남', '대구경북', '광주전라', '대전충청', '강원제주', '해외']
const ROLES = [
  { value: 'MEMBER',  label: '일반회원' },
  { value: 'PREMIUM', label: '정회원' },
  { value: 'OFFICER', label: '임원' },
  { value: 'ADMIN',   label: '관리자' },
]

interface FormState {
  email:        string
  password:     string
  name:         string
  position:     string
  organization: string
  phone:        string
  denomination: string
  address:      string
  region:       string
  role:         string
  expiresAt:    string
}

const EMPTY_FORM: FormState = {
  email: '', password: '', name: '', position: '',
  organization: '', phone: '', denomination: '',
  address: '', region: '', role: 'MEMBER', expiresAt: '',
}

export function MemberCreateButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  function openModal() {
    setForm(EMPTY_FORM)
    setError('')
    setTempPassword(null)
    setOpen(true)
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return }

    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        email:        form.email.trim(),
        password:     form.password.trim() || undefined,
        name:         form.name.trim()         || null,
        position:     form.position.trim()     || null,
        organization: form.organization.trim() || null,
        phone:        form.phone.trim()        || null,
        denomination: form.denomination.trim() || null,
        address:      form.address.trim()      || null,
        region:       form.region              || null,
        role:         form.role,
        expiresAt:    form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      }

      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error ?? '등록 실패')
      }

      if (data.tempPassword) {
        setTempPassword(data.tempPassword)
      } else {
        setOpen(false)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDone() {
    setOpen(false)
    setTempPassword(null)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#15305a] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        회원 직접 등록
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1B3A6B]">회원 직접 등록</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* 임시 비밀번호 결과 화면 */}
            {tempPassword ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-800">회원 등록 완료</p>
                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-amber-600 mb-2 font-medium">임시 비밀번호 (회원에게 전달하세요)</p>
                  <p className="text-xl font-mono font-bold text-amber-800 tracking-widest">{tempPassword}</p>
                </div>
                <p className="text-xs text-gray-400 text-center">회원이 로그인 후 비밀번호를 변경하도록 안내해주세요.</p>
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full py-2.5 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#15305a]"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                {/* 폼 */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                  {/* 이메일 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="example@email.com"
                      className={inputCls}
                      required
                    />
                  </div>

                  {/* 임시 비밀번호 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      비밀번호
                      <span className="text-gray-400 font-normal ml-1">(비워두면 자동 생성)</span>
                    </label>
                    <input
                      type="text"
                      value={form.password}
                      onChange={set('password')}
                      placeholder="8자 이상 (미입력 시 자동 생성)"
                      className={inputCls}
                    />
                  </div>

                  <hr className="border-gray-100" />

                  {/* 이름 / 직분 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">이름</label>
                      <input maxLength={50} value={form.name} onChange={set('name')} placeholder="홍길동" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">직분</label>
                      <input maxLength={50} value={form.position} onChange={set('position')} placeholder="목사, 선교사..." className={inputCls} />
                    </div>
                  </div>

                  {/* 소속 단체 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">소속 단체</label>
                    <input maxLength={100} value={form.organization} onChange={set('organization')} placeholder="○○교회 / ○○선교회" className={inputCls} />
                  </div>

                  {/* 연락처 / 교단 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">연락처</label>
                      <input maxLength={30} value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">교단</label>
                      <input maxLength={100} value={form.denomination} onChange={set('denomination')} placeholder="합동, 통합, 고신..." className={inputCls} />
                    </div>
                  </div>

                  {/* 주소 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">주소</label>
                    <input maxLength={200} value={form.address} onChange={set('address')} placeholder="서울시 강남구..." className={inputCls} />
                  </div>

                  {/* 지역 / 등급 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">지역</label>
                      <select value={form.region} onChange={set('region')} title="지역" className={inputCls}>
                        <option value="">선택 안함</option>
                        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">등급</label>
                      <select value={form.role} onChange={set('role')} title="등급" className={inputCls}>
                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 정회원 만료일 (정회원일 때만) */}
                  {form.role === 'PREMIUM' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        정회원 만료일
                        <span className="text-gray-400 font-normal ml-1">(미입력 시 오늘+1년)</span>
                      </label>
                      <input
                        type="date"
                        value={form.expiresAt}
                        onChange={set('expiresAt')}
                        title="정회원 만료일"
                        className={inputCls}
                      />
                    </div>
                  )}

                  {error && <p className="text-sm text-red-500">{error}</p>}
                </form>

                {/* 버튼 */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#15305a] disabled:opacity-50"
                  >
                    {submitting ? '등록 중...' : '등록'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
