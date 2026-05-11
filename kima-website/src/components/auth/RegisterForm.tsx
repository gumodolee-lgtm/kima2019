'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema'
import { FieldError } from './FieldError'

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.message || '가입 중 오류가 발생했습니다')
      return
    }
    router.push('/auth/login?registered=1')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
          placeholder="홍길동"
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
          placeholder="example@email.com"
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
        <input
          type="password"
          {...register('password')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
          placeholder="영문+숫자 8자 이상"
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인 *</label>
        <input
          type="password"
          {...register('passwordConfirm')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
          placeholder="비밀번호 재입력"
        />
        <FieldError message={errors.passwordConfirm?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          소속 단체 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          {...register('organization')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white"
          placeholder="소속 단체명"
        />
        <FieldError message={errors.organization?.message} />
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '가입 처리 중...' : '회원가입'}
      </button>
    </form>
  )
}
