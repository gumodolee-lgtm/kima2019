'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Badge } from '@/components/ui/Badge'

const NAV_LINKS = [
  { href: '/about', label: '소개' },
  { href: '/network', label: '디렉토리' },
  { href: '/community', label: '커뮤니티' },
  { href: '/story', label: '스토리' },
  { href: '/resources', label: '데이터' },
  { href: '/donate', label: '후원' },
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
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-[#1B3A6B]">KIMA</span>
            <span className="hidden sm:block text-xs text-gray-400 leading-tight">
              한국이주민<br />선교연합회
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-[#1B3A6B] font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
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
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        관리자
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
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

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-gray-700 hover:text-[#1B3A6B] hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <Link
                href="/auth/register"
                className="block px-3 py-2 text-sm text-[#1B3A6B] font-medium"
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
