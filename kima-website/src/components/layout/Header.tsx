'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Badge } from '@/components/ui/Badge'

type NavChild = { href: string; label: string; desc?: string }
type NavItem = { href: string; label: string; children?: NavChild[] }

const NAV_ITEMS: NavItem[] = [
  {
    href: '/about',
    label: '소개',
    children: [
      { href: '/about',             label: 'KIMA 소개',    desc: '한국이주민선교연합회 소개' },
      { href: '/about/history',     label: '설립 연혁',    desc: '창립부터 현재까지 걸어온 길' },
      { href: '/about/vision',      label: '비전 & 사명',  desc: '4기 비전과 6대 실행계획' },
      { href: '/about/leadership',  label: '임원단 소개',  desc: '4기 임원단 및 위원장' },
    ],
  },
  {
    href: '/network',
    label: '네트워크 사역',
    children: [
      { href: '/directory',          label: '단체 디렉토리',      desc: '전국 이주민 사역 단체 지도' },
      { href: '/network',            label: '리스닝콜 안내',       desc: '전국 이주민 사역자 리스닝콜' },
      { href: '/network/schedule',   label: '일정 & 참석 신청',   desc: '다음 리스닝콜·포럼 일정 확인' },
      { href: '/network/archive',    label: '지난 포럼 아카이브',  desc: '지난 리스닝콜·포럼 기록' },
    ],
  },
  {
    href: '/community',
    label: '사역별 커뮤니티',
    children: [
      { href: '/community',                   label: '커뮤니티 홈',  desc: '전체 카테고리 게시판' },
      { href: '/community?tab=REGION',        label: '지역별',       desc: '서울경기·부산경남·광주전라 외' },
      { href: '/community?tab=LANGUAGE',      label: '언어권별',     desc: '베트남·네팔·몽골·중국 외' },
      { href: '/community?tab=TARGET',        label: '사역대상별',   desc: '이주노동자·유학생·결혼이민자 외' },
    ],
  },
  {
    href: '/story',
    label: '현장스토리',
    children: [
      { href: '/story',  label: '스토리 목록',  desc: '현장 사역자들의 이야기' },
    ],
  },
  {
    href: '/resources',
    label: '사역자료',
  },
  {
    href: '/donate',
    label: '후원',
  },
]

function roleToBadgeVariant(role: string) {
  const map: Record<string, 'member' | 'premium' | 'officer' | 'admin'> = {
    MEMBER: 'member',
    PREMIUM: 'premium',
    OFFICER: 'officer',
    ADMIN: 'admin',
  }
  return map[role] ?? 'member'
}

export function Header() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = (href: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMenu(href)
  }

  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/kima-logo.png"
              alt="KIMA 한국이주민선교연합회"
              width={160}
              height={56}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => openMenu(item.href)}
                onMouseLeave={closeMenu}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeMenu === item.href
                      ? 'text-[#1B3A6B] bg-blue-50'
                      : 'text-gray-800 hover:text-[#1B3A6B] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {item.children && item.children.length > 1 && (
                    <svg
                      className={`w-3.5 h-3.5 mt-0.5 transition-transform ${activeMenu === item.href ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && item.children.length > 1 && activeMenu === item.href && (
                  <div
                    className="absolute top-full left-0 pt-1 z-50"
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeMenu}
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[200px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          onClick={() => setActiveMenu(null)}
                          className="flex flex-col px-4 py-2.5 hover:bg-blue-50 transition-colors group"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-[#1B3A6B]">
                            {child.label}
                          </span>
                          {child.desc && (
                            <span className="text-xs text-gray-400 mt-0.5">{child.desc}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B] transition-colors"
                >
                  <span className="hidden sm:block">{session.user.name ?? session.user.email}</span>
                  <Badge variant={roleToBadgeVariant(session.user.role)} />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <Link
                      href="/member/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      내 프로필
                    </Link>
                    {(session.user.role === 'ADMIN' || session.user.role === 'OFFICER') && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        {session.user.role === 'ADMIN' ? '관리자 메뉴' : '임원 메뉴'}
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-[#1B3A6B] font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#15305a] transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-[#1B3A6B]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu — accordion */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-2">
            {NAV_ITEMS.map((item) => {
              const hasChildren = item.children && item.children.length > 1
              const expanded = mobileExpanded === item.href

              return (
                <div key={item.href}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:text-[#1B3A6B]"
                      onClick={() => { if (!hasChildren) setMobileOpen(false) }}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        className="px-3 py-2.5 text-gray-400"
                        onClick={() => setMobileExpanded(expanded ? null : item.href)}
                        aria-label={expanded ? '접기' : '펼치기'}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {hasChildren && expanded && (
                    <div className="bg-gray-50 rounded-lg mx-3 mb-1">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-[#1B3A6B] border-b border-gray-100 last:border-0"
                          onClick={() => { setMobileOpen(false); setMobileExpanded(null) }}
                        >
                          <span className="w-1 h-1 rounded-full bg-[#C8922A] shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {!session && (
              <Link
                href="/auth/register"
                className="block mx-3 mt-2 px-3 py-2 text-sm text-[#1B3A6B] font-medium"
                onClick={() => setMobileOpen(false)}
              >
                회원가입
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
