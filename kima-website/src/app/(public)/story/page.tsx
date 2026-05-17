import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '현장스토리 | KIMA',
  description: '이주민 사역 현장의 이야기를 나눕니다.',
}

const SECTIONS = [
  {
    href: '/story/news',
    icon: '📰',
    label: 'KIMA 뉴스',
    desc: '외부 언론 기사·뉴스 링크 모음',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  {
    href: '/story/media',
    icon: '📸',
    label: 'KIMA 행사&영상',
    desc: 'KIMA가 주관·참여한 행사들의 사진·영상 갤러리',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  {
    href: '/story/field',
    icon: '✍️',
    label: '사역현장 이야기',
    desc: '회원들이 직접 나누는 현장 사역 이야기',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  {
    href: '/story/event-promo',
    icon: '📣',
    label: '이주민사역 행사 홍보',
    desc: '이주민 사역 관련 행사를 소개하고 알립니다',
    color: 'bg-rose-50 border-rose-200 text-rose-800',
  },
  {
    href: '/story/prayer',
    icon: '🙏',
    label: '중보기도 요청',
    desc: '함께 기도해 주세요. 기도가 현장을 바꿉니다.',
    color: 'bg-green-50 border-green-200 text-green-800',
  },
]

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Field Story</p>
          <h1 className="text-2xl font-bold">현장스토리</h1>
          <p className="mt-2 text-blue-200 text-sm">이주민 사역 현장의 이야기를 나눕니다.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}>
            <div className={`rounded-xl border p-6 hover:shadow-md transition-shadow cursor-pointer h-full ${s.color}`}>
              <p className="text-4xl mb-3">{s.icon}</p>
              <h2 className="text-lg font-bold mb-1">{s.label}</h2>
              <p className="text-sm opacity-80">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
