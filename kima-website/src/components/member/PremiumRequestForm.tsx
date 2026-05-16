'use client'

import { useState, useTransition } from 'react'

interface Props {
  hasPendingRequest: boolean
  pendingNote: string | null
}

export function PremiumRequestForm({ hasPendingRequest, pendingNote }: Props) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(hasPendingRequest)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    depositorName: '',
    amount: '50000',
    depositedAt: new Date().toISOString().slice(0, 10),
    memo: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.depositorName.trim()) {
      setError('입금자명을 입력해 주세요.')
      return
    }
    if (!form.depositedAt) {
      setError('입금일을 입력해 주세요.')
      return
    }
    startTransition(async () => {
      const res = await fetch('/api/member/request-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '신청 중 오류가 발생했습니다.')
        return
      }
      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-green-800 mb-1">입금 확인 신청이 접수되었습니다</h3>
            <p className="text-sm text-green-700 leading-relaxed">
              관리자가 입금을 확인한 후 정회원으로 승인해 드립니다.<br />
              승인 완료 시 등록하신 이메일로 안내 드립니다.
            </p>
            {pendingNote && (
              <p className="mt-2 text-xs text-green-600 bg-green-100 rounded-lg px-3 py-2 font-mono">
                {pendingNote.replace('[신청] ', '')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-[#1B3A6B] mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[#C8922A] text-white text-xs flex items-center justify-center font-bold">6</span>
        입금 확인 신청
      </h2>
      <p className="text-xs text-gray-400 mb-5">
        위 계좌로 입금 후 아래 정보를 입력하시면 관리자가 확인 후 정회원으로 승인해 드립니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">입금자명 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="depositorName"
            value={form.depositorName}
            onChange={handleChange}
            placeholder="통장에 표시된 입금자명"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">입금액</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="50000"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">입금일 <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="depositedAt"
              value={form.depositedAt}
              onChange={handleChange}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">메모 (선택)</label>
          <textarea
            name="memo"
            value={form.memo}
            onChange={handleChange}
            rows={2}
            placeholder="전달 사항이 있으면 입력해 주세요"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 resize-none"
            disabled={isPending}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#142d54] transition-colors disabled:opacity-50"
        >
          {isPending ? '신청 중…' : '입금 확인 신청하기'}
        </button>
      </form>
    </div>
  )
}
