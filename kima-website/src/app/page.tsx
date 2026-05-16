import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { auth } from '@/lib/auth'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { CounterSection } from '@/components/home/CounterSection'

const VISIONS = [
  {
    icon: '🔗',
    title: '연결',
    desc: '전국 다문화 사역 단체를 하나의 네트워크로 연결합니다.',
  },
  {
    icon: '📝',
    title: '기록',
    desc: '현장의 이야기와 데이터를 체계적으로 기록하고 보존합니다.',
  },
  {
    icon: '👁',
    title: '가시화',
    desc: '이주민 선교 현장을 세상에 보이게 합니다.',
  },
  {
    icon: '🤝',
    title: '후원 연결',
    desc: '필요한 곳에 자원이 흐르도록 후원자와 사역자를 잇습니다.',
  },
]

const STORIES = [
  {
    id: 1,
    category: '현장 이야기',
    title: '네팔 이주민 공동체와 함께한 추석 행사',
    excerpt: '영등포구 다문화 센터에서 진행된 추석 나눔 행사에 네팔 이주민 가정 50여 가정이 참여했습니다.',
    date: '2025-09-15',
  },
  {
    id: 2,
    category: '교육 자료',
    title: '이주민 한국어 교육 가이드북 2025 배포',
    excerpt: '전국 300여 교육 현장에서 활용 가능한 이주민 맞춤형 한국어 교재가 무료 배포됩니다.',
    date: '2025-08-20',
  },
  {
    id: 3,
    category: '단체 소식',
    title: '2025 KIMA 전국 연합 세미나 개최',
    excerpt: '오는 11월, 전국 이주민 선교 단체 대표자 200여 명이 참여하는 연합 세미나가 개최됩니다.',
    date: '2025-07-30',
  },
]

const UPCOMING_EVENTS = [
  {
    date: { month: '11월', day: '22' },
    title: '2025 KIMA 전국 연합 세미나',
    location: '서울 여의도순복음교회 대강당',
  },
  {
    date: { month: '12월', day: '07' },
    title: '이주민 크리스마스 축제',
    location: '수원 중앙침례교회',
  },
]

// 협력 기관 목록 — 로고 이미지 준비 시 logoSrc 경로를 추가하면 자동으로 이미지로 전환됨
// 예: { name: '한국선교연구원', logoSrc: '/images/partners/krim.png' }
const PARTNER_LOGOS: { name: string; logoSrc?: string }[] = [
  { name: '한국선교연구원' },
  { name: '한국이주민건강협회' },
  { name: '다문화교육진흥원' },
  { name: '이주민복지연합' },
  { name: '글로벌케어' },
  { name: '다일공동체' },
]

export default async function HomePage() {
  const session = await auth()
  return (
    <>
      {/* 1. 히어로 슬라이드 */}
      <HeroCarousel isLoggedIn={!!session} />

      {/* 2. 숫자 카운터 (뷰포트 진입 시 애니메이션) */}
      <CounterSection />

      {/* 3. 4대 비전 */}
      <section className="bg-[#F8F9FA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B3A6B]">KIMA의 4대 비전</h2>
            <p className="mt-3 text-gray-500 text-sm">연결·기록·가시화·후원 연결을 통해 이주민 선교를 섬깁니다</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VISIONS.map((v) => (
              <Card key={v.title} className="text-center p-6">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-[#1B3A6B] mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 최신 스토리 3개 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#1B3A6B]">최신 스토리</h2>
              <p className="mt-2 text-sm text-gray-500">현장의 이야기를 전합니다</p>
            </div>
            <Link href="/story" className="text-sm text-[#1B3A6B] font-medium hover:underline">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORIES.map((story) => (
              <Card key={story.id} hover className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#1B3A6B] to-[#C8922A]" />
                <CardContent className="p-6">
                  <span className="text-xs font-semibold text-[#C8922A] uppercase tracking-wide">
                    {story.category}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#1A1A1A] leading-snug line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {story.excerpt}
                  </p>
                  <p className="mt-4 text-xs text-gray-400">{story.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 다음 일정 */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1B3A6B]">다가오는 일정</h2>
            <Link href="/community" className="text-sm text-[#1B3A6B] font-medium hover:underline">
              전체 일정 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UPCOMING_EVENTS.map((event) => (
              <Card key={event.title} className="flex items-center gap-6 p-5">
                <div className="shrink-0 w-14 text-center">
                  <div className="text-xs font-semibold text-[#C8922A]">{event.date.month}</div>
                  <div className="text-3xl font-bold text-[#1B3A6B] leading-none">{event.date.day}</div>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">{event.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{event.location}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 후원 배너 */}
      <section className="bg-[#C8922A] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">이주민 선교를 함께 후원해 주세요</h2>
          <p className="text-amber-100 text-base mb-8 leading-relaxed">
            여러분의 후원이 전국 이주민 사역 현장에 희망을 전달합니다.<br />
            소액이라도 큰 변화를 만들어냅니다.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center px-8 py-3.5 rounded-lg bg-white text-[#C8922A] font-bold hover:bg-amber-50 transition-colors shadow-sm"
          >
            후원하기
          </Link>
        </div>
      </section>

      {/* 7. 협력 기관 로고 */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">
            협력 기관
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {PARTNER_LOGOS.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center justify-center h-16 rounded-xl bg-gray-50 border border-gray-100 px-3 hover:border-gray-200 transition-colors"
              >
                {partner.logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoSrc}
                    alt={partner.name}
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-medium text-center leading-tight">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
