import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const ROLE_HIERARCHY = { MEMBER: 1, PREMIUM: 2, OFFICER: 3, ADMIN: 4 } as const

function hasRole(userRole: string | undefined, required: keyof typeof ROLE_HIERARCHY) {
  if (!userRole) return false
  return (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0) >= ROLE_HIERARCHY[required]
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // 관리자 전용 → 미충족 시 홈으로
  if (pathname.startsWith('/admin')) {
    if (!hasRole(userRole, 'ADMIN')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // 정회원 이상 → 미충족 시 업그레이드 페이지로
  if (pathname.startsWith('/resources')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${pathname}`, req.url))
    }
    if (!hasRole(userRole, 'PREMIUM')) {
      return NextResponse.redirect(new URL('/member/upgrade', req.url))
    }
  }

  // 일반회원 이상 → 미로그인 시 로그인 페이지로
  if (pathname.startsWith('/community') || pathname.startsWith('/network')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${pathname}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/community/:path*', '/network/:path*', '/resources/:path*'],
}
