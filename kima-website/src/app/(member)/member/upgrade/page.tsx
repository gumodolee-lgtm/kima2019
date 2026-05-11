import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '정회원 신청 | KIMA' }

export default async function UpgradePage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/member/upgrade')
  }

  const role = session.user.role
  const isPremium = role === 'PREMIUM' || role === 'OFFICER' || role === 'ADMIN'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isPremium ? (
          /* 이미 정회원인 경우 */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1B3A6B] mb-2">이미 정회원이십니다</h1>
            <p className="text-gray-500 mb-6">정회원 전용 자료실에 자유롭게 접근하실 수 있습니다.</p>
            <a
              href="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white font-medium hover:bg-[#142d54] transition-colors"
            >
              자료실 바로가기
            </a>
          </div>
        ) : (
          /* 정회원 신청 안내 */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1B3A6B]">정회원 신청 안내</h1>
              <p className="mt-2 text-gray-500">
                정회원은 연 회비 납부 후 사무국 확인을 거쳐 승인됩니다.
              </p>
            </div>

            {/* 혜택 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h2 className="font-semibold text-amber-800 mb-3">정회원 혜택</h2>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  자료실 정회원 전용 자료 열람 (비자·법률, 의료·복지, 보조금·공모, 선교·훈련)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  리스닝콜·포럼 우선 참석 신청
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  연 1회 KIMA 연합 포럼 정회원 가격 참가
                </li>
              </ul>
            </div>

            {/* 납부 안내 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1B3A6B] mb-4">납부 방법</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">연 회비</p>
                  <p className="text-2xl font-bold text-[#1B3A6B]">50,000원</p>
                  <p className="text-xs text-gray-400 mt-1">납부일로부터 1년간 유효</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">입금 계좌</p>
                  <div className="flex items-center gap-3 p-4 bg-[#1B3A6B] rounded-lg text-white">
                    <div>
                      <p className="text-xs text-blue-200 mb-0.5">국민은행</p>
                      <p className="text-lg font-bold tracking-wide">263101-04-561156</p>
                      <p className="text-xs text-blue-200 mt-0.5">예금주: 이창호 (한국이주민선교연합회)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 신청 방법 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1B3A6B] mb-4">신청 방법</h2>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B3A6B] text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>위 계좌로 연 회비 5만원을 입금합니다.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B3A6B] text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>
                    입금자 성명, 금액, 가입 이메일을 아래 방법으로 사무국에 알려주세요.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B3A6B] text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>사무국 확인 후 정회원 등급으로 전환됩니다. (영업일 기준 1~3일)</span>
                </li>
              </ol>
            </div>

            {/* 연락처 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1B3A6B] mb-4">사무국 연락처</h2>
              <div className="space-y-3 text-sm">
                <a
                  href="mailto:admin@kima2019.org"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">이메일</p>
                    <p className="font-medium text-gray-700 group-hover:text-[#1B3A6B]">admin@kima2019.org</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.02 2 11c0 2.67 1.18 5.07 3.07 6.76L4 22l4.45-1.16C9.57 21.57 10.76 21.8 12 21.8c5.52 0 10-4.02 10-9S17.52 2 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">카카오톡 채널</p>
                    <p className="font-medium text-gray-700">KIMA 사무국 채널 검색</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 기부금 영수증 안내 */}
            <p className="text-xs text-gray-400 text-center">
              기부금 영수증은 비영리단체 등록 완료 후 발급 예정입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
