import type { Metadata } from 'next'

export const metadata: Metadata = { title: '4기 비전 & 실행계획 | KIMA' }

const PLANS = [
  { no: 1, title: '전국 단체 디렉토리 구축', desc: '지역별·언어권별·사역대상별로 분류된 회원단체 지도를 공개하여 협력 네트워크를 가시화합니다.' },
  { no: 2, title: '이주민 현황 데이터 허브', desc: '법무부·통계청 기초 데이터와 현장 조사 결과를 정기 업데이트하여 이주민 사역의 근거 자료를 제공합니다.' },
  { no: 3, title: '사역 나눔 커뮤니티 활성화', desc: '지역·언어권·사역대상 카테고리별 게시판을 통해 현장 사례와 자료를 나눕니다.' },
  { no: 4, title: '리스닝콜 정례화', desc: '매 분기 전국 리스닝콜을 온오프라인 병행으로 개최하여 현장 목소리를 정책에 반영합니다.' },
  { no: 5, title: '후원 연결 시스템 구축', desc: '개인 후원자와 사역 단체를 직접 연결하는 매칭 플랫폼을 단계적으로 구축합니다.' },
  { no: 6, title: '비영리법인 등록 완료', desc: '기부금 영수증 발행을 위한 법인화를 완료하고 재정 투명성을 높입니다.' },
]

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Vision</p>
          <h1 className="text-3xl font-bold">4기 비전 & 6대 실행계획</h1>
          <p className="mt-3 text-blue-200">2024년, 새로운 10년을 향한 도약</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* 4기 비전 선언 */}
        <section className="mb-14">
          <div className="bg-white rounded-xl border-l-4 border-[#C8922A] shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#1B3A6B] mb-4">4기 비전 선언</h2>
            <blockquote className="text-gray-700 leading-relaxed text-lg italic border-none pl-0">
              "한국 내 이주민 사역이 <strong>연결되고 기록되고 보이게 되어</strong>,<br />
              하나님 나라의 다양성이 한국교회 안에 풍성해지기를 소망합니다."
            </blockquote>
          </div>
        </section>

        {/* 수치 목표 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-6">4기 목표 수치</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '150+', label: '회원단체' },
              { value: '4회', label: '연간 리스닝콜' },
              { value: '100만', label: '후원 연결 목표' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-3xl font-bold text-[#C8922A]">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6대 실행계획 */}
        <section>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-6">6대 실행계획</h2>
          <div className="space-y-4">
            {PLANS.map((plan) => (
              <div key={plan.no} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center font-bold text-lg">
                  {plan.no}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{plan.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
