'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const REGIONS = [
  '서울',
  '경기',
  '인천',
  '부산경남',
  '대구경북',
  '광주전라',
  '대전충청',
  '강원제주',
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [organization, setOrganization] = useState('')
  const [region, setRegion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSkip = () => {
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization: organization.trim() || null, region: region || null }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? '저장에 실패했습니다')
      }

      await update()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">로그인이 필요합니다.</p>
          <Link href="/auth/login" className="text-[#1B3A6B] font-medium hover:underline mt-2 block">
            로그인하기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B3A6B]">KIMA</Link>
          <p className="text-gray-500 mt-1 text-sm">한국이주민선교연합회</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">추가 정보 입력</h1>
          <p className="text-sm text-gray-500 mb-6">
            선택 사항입니다. 나중에 마이페이지에서도 변경할 수 있습니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소속 단체 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
                placeholder="소속 단체명을 입력해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지역 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white"
              >
                <option value="">지역 선택</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : '저장하고 시작하기'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              건너뛰기
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
