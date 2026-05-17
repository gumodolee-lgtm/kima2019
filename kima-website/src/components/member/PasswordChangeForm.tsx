'use client'

import { useState } from 'react'

export function PasswordChangeForm() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
      } else {
        setSuccess(true)
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setOpen(false)
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {success && (
        <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          ✅ 비밀번호가 변경되었습니다.
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => { setOpen(true); setSuccess(false) }}
          className="text-sm text-[#1B3A6B] font-medium border border-[#1B3A6B] rounded-lg px-4 py-2 hover:bg-[#1B3A6B] hover:text-white transition-colors"
        >
          비밀번호 변경
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">비밀번호 변경</h4>

          {[
            { name: 'currentPassword', label: '현재 비밀번호', placeholder: '현재 비밀번호 입력' },
            { name: 'newPassword',     label: '새 비밀번호',   placeholder: '8자 이상 입력' },
            { name: 'confirmPassword', label: '새 비밀번호 확인', placeholder: '새 비밀번호 재입력' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
              <input
                type="password"
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B]"
              />
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1B3A6B] text-white text-sm font-medium rounded-lg py-2 hover:bg-[#15305a] transition-colors disabled:opacity-50"
            >
              {loading ? '변경 중…' : '변경하기'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(''); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}
              className="px-4 text-sm text-gray-500 border border-gray-200 rounded-lg py-2 hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
