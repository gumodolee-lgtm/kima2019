'use client'

import { useState, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function AttendPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setError('이름과 이메일은 필수입니다.')
      return
    }
    setError('')
    startTransition(async () => {
      const res = await fetch(`/api/events/${id}/attend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '신청 중 오류가 발생했습니다.')
        return
      }
      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-2">참석 신청이 완료되었습니다!</h2>
          <p className="text-gray-500 text-sm mb-6">확인 이메일이 발송되었습니다. 이메일을 확인해 주세요.</p>
          <a href="/network/schedule" className="inline-block px-6 py-2.5 rounded-xl bg-[#1B3A6B] text-white font-medium hover:bg-[#142d54] transition-colors">
            일정 목록으로
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <a href="/network/schedule" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6 transition-colors">
          ← 일정 목록
        </a>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-[#1B3A6B] mb-6">참석 신청</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">이름 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-sm"
                placeholder="홍길동"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일 *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-sm"
                placeholder="example@email.com"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처 (선택)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-sm"
                placeholder="010-0000-0000"
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-[#1B3A6B] text-white font-semibold hover:bg-[#142d54] disabled:opacity-50 transition-colors"
            >
              {isPending ? '신청 중…' : '참석 신청하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
