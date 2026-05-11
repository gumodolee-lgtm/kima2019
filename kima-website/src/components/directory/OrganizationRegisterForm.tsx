'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { organizationSchema, LANGUAGES, TARGETS, ORG_TYPES, type OrganizationInput } from '@/schemas/organization.schema'
import { REGIONS } from '@/schemas/member.schema'
import { FieldError } from '@/components/auth/FieldError'
import { Button } from '@/components/ui/Button'

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
  error,
}: {
  label: string
  options: readonly string[]
  selected: string[]
  onChange: (values: string[]) => void
  error?: string
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selected.includes(opt)
                ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3A6B]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <FieldError message={error} />}
    </div>
  )
}

export function OrganizationRegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { languages: [], targets: [] },
  })

  const languages = watch('languages') as string[]
  const targets = watch('targets') as string[]

  const onSubmit = async (data: OrganizationInput) => {
    setServerError(null)
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setServerError(body.error ?? '등록 중 오류가 발생했습니다.')
        return
      }
      setSubmitted(true)
    } catch {
      setServerError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-[#1B3A6B] mb-2">신청이 완료되었습니다</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          관리자 검토 후 디렉토리에 등재됩니다. (보통 3~5 영업일 소요)
        </p>
        <Button onClick={() => router.push('/directory')}>디렉토리로 돌아가기</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          단체명 <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          placeholder="예: 서울다문화선교회"
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">영문 단체명 (선택)</label>
        <input
          {...register('nameEn')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          placeholder="Seoul Multicultural Mission"
        />
        <FieldError message={errors.nameEn?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          지역 <span className="text-red-500">*</span>
        </label>
        <select
          {...register('region')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 text-gray-700"
        >
          <option value="">지역을 선택해주세요</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <FieldError message={errors.region?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">사역유형 (선택)</label>
        <select
          {...register('type')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 text-gray-700"
        >
          <option value="">유형 선택 (선택사항)</option>
          {ORG_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <CheckboxGroup
        label="주요 언어권 (최소 1개 선택) *"
        options={LANGUAGES}
        selected={languages}
        onChange={(vals) => setValue('languages', vals as OrganizationInput['languages'], { shouldValidate: true })}
        error={errors.languages?.message}
      />

      <CheckboxGroup
        label="사역대상 (최소 1개 선택) *"
        options={TARGETS}
        selected={targets}
        onChange={(vals) => setValue('targets', vals as OrganizationInput['targets'], { shouldValidate: true })}
        error={errors.targets?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">단체 소개 (선택)</label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 resize-none"
          placeholder="단체의 사역 내용과 비전을 간략히 소개해 주세요 (500자 이내)"
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">주소 (선택)</label>
        <input
          {...register('address')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          placeholder="서울특별시 영등포구..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 (선택)</label>
          <input
            {...register('phone')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
            placeholder="02-000-0000"
          />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일 (선택)</label>
          <input
            {...register('email')}
            type="email"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
            placeholder="example@kima.org"
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트 (선택)</label>
        <input
          {...register('website')}
          type="url"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          placeholder="https://example.org"
        />
        <FieldError message={errors.website?.message} />
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <p className="text-xs text-gray-400">
        * 관리자 승인 후 디렉토리에 공개됩니다. 허위 정보 등록 시 삭제될 수 있습니다.
      </p>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        {isSubmitting ? '신청 중...' : '등록 신청하기'}
      </Button>
    </form>
  )
}
