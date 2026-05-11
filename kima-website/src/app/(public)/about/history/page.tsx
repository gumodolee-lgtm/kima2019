import type { Metadata } from 'next'

export const metadata: Metadata = { title: '설립 배경 & 연혁 | KIMA' }

const TIMELINE = [
  {
    period: '1기 (2015–2018)',
    color: 'border-blue-400',
    bg: 'bg-blue-50',
    events: [
      { year: '2015', text: '한국이주민선교연합회 창립 발기인 모임' },
      { year: '2016', text: '초대 위원장 선출 및 지역별 카테고리 구성' },
      { year: '2017', text: '첫 번째 리스닝콜 개최 (전국 사역자 40여 명 참여)' },
      { year: '2018', text: '회원단체 50개 돌파, 전국 네트워크 구축' },
    ],
  },
  {
    period: '2기 (2019–2021)',
    color: 'border-[#C8922A]',
    bg: 'bg-amber-50',
    events: [
      { year: '2019', text: 'kima2019.org 도메인 등록 및 공식 출범' },
      { year: '2020', text: 'COVID-19 대응 — 이주민 긴급 지원 네트워크 가동' },
      { year: '2021', text: '온라인 리스닝콜 전환, 참여 단체 전국 80개 이상' },
    ],
  },
  {
    period: '3기 (2022–2023)',
    color: 'border-purple-400',
    bg: 'bg-purple-50',
    events: [
      { year: '2022', text: '비영리단체 법인화 준비 착수' },
      { year: '2022', text: '이주민 현황 백서 1호 발간' },
      { year: '2023', text: '전국 포럼 개최 (서울·부산·대구 3개 도시 순회)' },
      { year: '2023', text: '언어권별 위원장 체계 정비, 9개 언어권 담당자 선임' },
    ],
  },
  {
    period: '4기 (2024–현재)',
    color: 'border-green-400',
    bg: 'bg-green-50',
    events: [
      { year: '2024', text: '4기 집행부 출범 — 디지털 전환 및 플랫폼 구축 선언' },
      { year: '2024', text: 'KIMA 홈페이지 리뉴얼 (kima2019.org) 오픈' },
      { year: '2025', text: '회원단체 디렉토리 공개, 전국 지도 서비스 시작' },
    ],
  },
]

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">History</p>
          <h1 className="text-3xl font-bold">설립 배경 & 연혁</h1>
          <p className="mt-3 text-blue-200">한국 내 다문화사역 연합의 10년 발자취</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* 설립 배경 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-4">설립 배경</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-7 text-gray-700 leading-relaxed space-y-3">
            <p>
              2010년대 중반, 한국 내 이주민 인구가 200만 명을 넘어서면서 교회와 NGO 현장에서는
              각자도생의 한계를 절감하기 시작했습니다. 중복 지원, 정보 단절, 재정 불균형 등
              연합 없이는 해결할 수 없는 구조적 문제들이 드러났습니다.
            </p>
            <p>
              이에 전국 각지에서 다문화사역을 감당하던 목회자·사역자들이 모여,
              <strong> "흩어져 있으면 약하고, 함께하면 강하다"</strong>는 신념으로
              한국이주민선교연합회(KIMA)를 창립하였습니다.
            </p>
          </div>
        </section>

        {/* 연혁 타임라인 */}
        <section>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-8">연혁</h2>
          <div className="space-y-10">
            {TIMELINE.map((phase) => (
              <div key={phase.period}>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${phase.bg}`}>
                  {phase.period}
                </div>
                <div className={`border-l-4 ${phase.color} pl-6 space-y-4`}>
                  {phase.events.map((e, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="flex-shrink-0 text-sm font-bold text-gray-400 w-10">{e.year}</span>
                      <p className="text-gray-700">{e.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
