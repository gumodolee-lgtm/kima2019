import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { auth } from '@/lib/auth'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { prisma } from '@/lib/prisma'

const STATS = [
  { label: '가입 단체', value: '120+', unit: '개' },
  { label: '이주민 대상국', value: '30+', unit: '개국' },
  { label: '활동 회원', value: '500+', unit: '명' },
  { label: '등록 자료', value: '1,200+', unit: '건' },
]

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

const PARTNER_LOGOS = [
  '한국선교연구원', '한국이주민건강협회', '다문화교육진흥원',
  '이주민복지연합', '글로벌케어', '다일공동체',
]

export default async function HomePage() {
  const session = await auth()

  const [dbStories, dbEvents] = await Promise.all([
    prisma.story.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }).catch(() => []),
    prisma.event.findMany({
      where: { scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
      take: 4,
    }).catch(() => []),
  ])

  return (
    <>
      {/* 1. 히어로 슬라이드 */}
      <HeroCarousel isLoggedIn={!!session} />

      {/* 2. 숫자 카운터 */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-[#1B3A6B]">
                  {stat.value}
                  <span className="text-xl font-medium text-[#C8922A] ml-1">{stat.unit}</span>
                </p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {dbStories.length > 0 ? dbStories.map((story) => (
              <Link key={story.id} href={`/story/${story.id}`}>
                <Card hover className="overflow-hidden h-full">
                  <div className="h-2 bg-gradient-to-r from-[#1B3A6B] to-[#C8922A]" />
                  <CardContent className="p-6">
                    <span className="text-xs font-semibold text-[#C8922A] uppercase tracking-wide">
                      {story.type === 'NEWS' ? 'KIMA 뉴스'
                        : story.type === 'FIELD_STORY' ? '사역현장 이야기'
                        : story.type === 'EVENT_MEDIA' ? '행사 사진영상'
                        : story.type === 'PRAYER_REQUEST' ? '중보기도 요청'
                        : '현장스토리'}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-[#1A1A1A] leading-snug line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {story.excerpt ?? ''}
                    </p>
                    <p className="mt-4 text-xs text-gray-400">
                      {story.createdAt.toLocaleDateString('ko-KR')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <p className="col-span-3 text-center text-gray-400 py-10">등록된 스토리가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {/* 5. 다음 일정 */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1B3A6B]">다가오는 일정</h2>
            <Link href="/network/schedule" className="text-sm text-[#1B3A6B] font-medium hover:underline">
              전체 일정 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbEvents.length > 0 ? dbEvents.map((event) => (
              <Card key={event.id} className="flex items-center gap-6 p-5">
                <div className="shrink-0 w-14 text-center">
                  <div className="text-xs font-semibold text-[#C8922A]">
                    {event.scheduledAt.toLocaleDateString('ko-KR', { month: 'long' })}
                  </div>
                  <div className="text-3xl font-bold text-[#1B3A6B] leading-none">
                    {event.scheduledAt.getDate()}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{event.description}</p>
                  )}
                </div>
              </Card>
            )) : (
              <p className="col-span-2 text-center text-gray-400 py-10">예정된 일정이 없습니다.</p>
            )}
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
            {PARTNER_LOGOS.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center h-16 rounded-xl bg-gray-50 border border-gray-100 px-3"
              >
                <span className="text-xs text-gray-400 font-medium text-center leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
