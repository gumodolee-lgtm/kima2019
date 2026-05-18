import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'KIMA 소개 | 한국이주민선교연합회',
  description: '한국이주민선교연합회(KIMA)는 전국 다문화사역 단체들이 연합하는 플랫폼입니다.',
}

const SECTIONS = [
  { href: '/about/greeting', icon: '🙏', title: '상임대표 인사말', desc: '남양규 상임대표 인사 및 약력' },
  { href: '/about/history', icon: '📖', title: '설립 배경 & 연혁', desc: '1~3기 역사와 발자취' },
  { href: '/about/vision', icon: '🎯', title: '4기 비전 & 실행계획', desc: '2024년 새로운 도약의 방향' },
  { href: '/about/leadership', icon: '👤', title: '임원단 소개', desc: '전국 위원장·임원진 프로필' },
  { href: '/about/brand', icon: '🎨', title: 'CI 가이드', desc: '로고·색상·폰트 브랜드 자산' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 히어로 */}
      <div className="bg-[#1B3A6B] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-3">About KIMA</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            한국이주민선교연합회
          </h1>
          <p className="mt-4 text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
            "연결하고 · 기록하고 · 보이게 하고 · 후원으로 이어주는"<br />
            전국 다문화사역 연합 플랫폼
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 단체 소개 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">단체 소개</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-4 text-gray-700 leading-relaxed">
            <p>
              한국이주민선교연합회(KIMA, Korea Immigrants Missions Association)는 한국 내 다문화사역을 감당하는
              교회, NGO, 법률·복지 기관들이 모인 전국 연합 플랫폼입니다.
            </p>
            <p>
              이주노동자, 유학생, 결혼이민자, 다문화자녀, 난민·미등록 이주민, 귀국이주민 등
              다양한 배경의 이주민들을 섬기는 사역자들이 함께 연결되어, 정보를 나누고
              협력하며 하나님의 선교를 이루어 갑니다.
            </p>
            <p>
              현재 전국 6개 지역, 9개 언어권, 6개 사역대상 카테고리로 구성되어 있으며,
              정기적인 리스닝콜·포럼을 통해 현장의 목소리를 듣고 연대합니다.
            </p>
          </div>
        </section>

        {/* 정관 다운로드 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">정관</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📋</span>
              <div>
                <p className="font-semibold text-gray-900">KIMA 정관</p>
                <p className="text-sm text-gray-500 mt-0.5">개정일: 2026년 3월 19일 · DOCX</p>
              </div>
            </div>
            <a
              href="/KIMA%EC%A0%95%EA%B4%80_20260319.docx"
              download="KIMA정관_20260319.docx"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#142d54] transition-colors"
            >
              ⬇ 다운로드
            </a>
          </div>
        </section>

        {/* 4대 비전 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">4대 사명</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🔗', word: 'CONNECT', desc: '전국 다문화사역 단체를 하나로 연결합니다' },
              { icon: '📊', word: 'DATA', desc: '이주민 현황과 사역 데이터를 기록·공유합니다' },
              { icon: '📣', word: 'STORY', desc: '현장의 이야기를 세상에 보이게 합니다' },
              { icon: '💛', word: 'FUND', desc: '후원자와 사역을 이어 재정을 흘려보냅니다' },
            ].map((v) => (
              <div key={v.word} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-4 items-start">
                <span className="text-3xl">{v.icon}</span>
                <div>
                  <p className="font-bold text-[#C8922A] text-lg">{v.word}</p>
                  <p className="text-gray-600 text-sm mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 서브 섹션 링크 */}
        <section>
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">더 알아보기</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-4 items-center hover:shadow-md hover:border-[#C8922A] transition-all group"
              >
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B3A6B]">{s.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
