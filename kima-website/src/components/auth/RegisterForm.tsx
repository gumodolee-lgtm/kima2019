'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  registerSchema,
  type RegisterInput,
  POSITIONS,
  MINISTRY_LANGUAGES,
  MINISTRY_TARGETS,
} from '@/schemas/auth.schema'
import { FieldError } from './FieldError'

const INPUT =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] text-gray-900 bg-white text-sm'
const LABEL = 'block text-sm font-medium text-gray-700 mb-1'
const SECTION = 'bg-gray-50 rounded-xl p-5 space-y-4'
const SECTION_TITLE = 'text-sm font-semibold text-[#1B3A6B] mb-3 pb-1 border-b border-gray-200'

function CheckboxGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: readonly string[]
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              value.includes(opt)
                ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#1B3A6B]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [targets, setTargets] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { ministryLanguages: [], ministryTargets: [] },
  })

  const handleLanguagesChange = (v: string[]) => {
    setLanguages(v)
    setValue('ministryLanguages', v, { shouldValidate: true })
  }

  const handleTargetsChange = (v: string[]) => {
    setTargets(v)
    setValue('ministryTargets', v, { shouldValidate: true })
  }

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

      {/* 기본 정보 */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>기본 정보</p>

        <div>
          <label className={LABEL}>이름 *</label>
          <input type="text" {...register('name')} className={INPUT} placeholder="홍길동" />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <label className={LABEL}>이메일 *</label>
          <input type="email" {...register('email')} className={INPUT} placeholder="example@email.com" />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>비밀번호 *</label>
            <input type="password" {...register('password')} className={INPUT} placeholder="영문+숫자 8자 이상" />
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <label className={LABEL}>비밀번호 확인 *</label>
            <input type="password" {...register('passwordConfirm')} className={INPUT} placeholder="비밀번호 재입력" />
            <FieldError message={errors.passwordConfirm?.message} />
          </div>
        </div>
      </div>

      {/* 사역 정보 */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>사역 정보</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>직분 *</label>
            <select {...register('position')} className={INPUT}>
              <option value="">직분 선택</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <FieldError message={errors.position?.message} />
          </div>

          <div>
            <label className={LABEL}>전화번호 *</label>
            <input
              type="tel"
              {...register('phone')}
              className={INPUT}
              placeholder="010-0000-0000"
            />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>

        <div>
          <label className={LABEL}>소속 교단 *</label>
          <input
            type="text"
            {...register('denomination')}
            className={INPUT}
            placeholder="예) 예장합동, 예장통합, 기감, 기침 등"
          />
          <FieldError message={errors.denomination?.message} />
        </div>

        <div>
          <label className={LABEL}>
            소속 단체 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <input
            type="text"
            {...register('organization')}
            className={INPUT}
            placeholder="소속 단체명 또는 교회명"
          />
          <FieldError message={errors.organization?.message} />
        </div>

        <div>
          <label className={LABEL}>주소 *</label>
          <input
            type="text"
            {...register('address')}
            className={INPUT}
            placeholder="예) 서울시 강남구 역삼동"
          />
          <FieldError message={errors.address?.message} />
        </div>
      </div>

      {/* 사역 언어 */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>사역 언어 * (복수 선택)</p>
        <CheckboxGroup
          options={MINISTRY_LANGUAGES}
          value={languages}
          onChange={handleLanguagesChange}
          error={errors.ministryLanguages?.message}
        />
      </div>

      {/* 사역 대상 */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>사역 대상 * (복수 선택)</p>
        <CheckboxGroup
          options={MINISTRY_TARGETS}
          value={targets}
          onChange={handleTargetsChange}
          error={errors.ministryTargets?.message}
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isSubmitting ? '가입 처리 중...' : '회원가입'}
      </button>
    </form>
  )
}
