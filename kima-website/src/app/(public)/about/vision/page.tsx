import type { Metadata } from 'next'

export const metadata: Metadata = { title: '비전 & 사명 | KIMA' }

const MISSION_ITEMS = [
  { no: 1, title: '연합 네트워크 구축', desc: '전국 이주민 사역 단체를 지역별·언어권별·사역대상별로 연결하여 협력 생태계를 형성합니다.' },
  { no: 2, title: '현장 소통 (리스닝콜)', desc: '분기별 리스닝콜을 온오프라인으로 개최하여 현장 사역자의 목소리를 정책에 반영합니다.' },
  { no: 3, title: '정보·자료 허브', desc: '이주민 현황 통계·법률·복지 정보를 정리하여 회원 단체가 사역에 즉시 활용할 수 있도록 제공합니다.' },
  { no: 4, title: '사역 나눔 커뮤니티', desc: '지역·언어권·사역대상 카테고리별 게시판을 통해 현장 사례와 자료를 나눕니다.' },
  { no: 5, title: '후원 연결', desc: '개인·교회 후원자와 이주민 사역 단체를 직접 연결하는 채널을 운영합니다.' },
  { no: 6, title: '세계선교 연대', desc: '국내 이주민 선교를 세계선교의 관점으로 확장하고, 해외 선교 기관과 협력합니다.' },
]

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Vision & Mission</p>
          <h1 className="text-3xl font-bold">비전 & 사명</h1>
          <p className="mt-3 text-blue-200">400만 이주민 시대를 향한 KIMA의 부르심</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* 비전 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-4">비전</h2>
          <div className="bg-white rounded-xl border-l-4 border-[#C8922A] shadow-sm p-8">
            <p className="text-gray-700 leading-relaxed text-base">
              KIMA는 하나님의 명령(창 1:26; 마 28:18-20)을 준행하여 이 땅에 보내신 이주민들을
              각양의 은사(엡 4:11-16)를 통해 <strong>그리스도의 모범(빌 2:1-11)을 따라 섬긴다.</strong>
            </p>
          </div>
        </section>

        {/* 사명 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-4">사명</h2>
          <div className="bg-white rounded-xl border-l-4 border-[#1B3A6B] shadow-sm p-8">
            <p className="text-gray-700 leading-relaxed text-base">
              KIMA는 향후 <strong>400만 이주민 시대</strong>를 준비하며 국내 이주민 선교를 통한
              세계선교의 사명으로(행 1:8) 국내 회원 간의 소통과 연합을 도모하며 활동한다(시 133:1-3).
            </p>
          </div>
        </section>

        {/* 슬로건 */}
        <section className="mb-12">
          <div className="bg-[#1B3A6B] rounded-2xl p-8 text-white text-center">
            <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-3">Slogan</p>
            <p className="text-xl font-bold leading-relaxed">
              연결하고 · 기록하고 · 보이게 하고 · 후원으로 이어주는
            </p>
            <p className="text-blue-200 text-sm mt-2">한국이주민선교연합회</p>
          </div>
        </section>

        {/* 4기 목표 수치 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-6">4기 목표</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '400만', label: '이주민 시대 대비' },
              { value: '분기별', label: '리스닝콜 정례화' },
              { value: '전국', label: '언어권·지역 네트워크' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-2xl font-bold text-[#C8922A]">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6대 사명 */}
        <section>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-6">6대 사명 항목</h2>
          <div className="space-y-4">
            {MISSION_ITEMS.map((item) => (
              <div key={item.no} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center font-bold text-lg">
                  {item.no}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
