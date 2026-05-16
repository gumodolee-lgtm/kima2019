import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const ROLE_HIERARCHY = { MEMBER: 1, PREMIUM: 2, OFFICER: 3, ADMIN: 4 } as const

function hasRole(userRole: string | undefined, required: keyof typeof ROLE_HIERARCHY) {
  if (!userRole) return false
  return (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0) >= ROLE_HIERARCHY[required]
}

// Vercel Edge Runtime에서 req.url의 도메인이 *.vercel.app으로 처리되는 문제 방지
// x-forwarded-host 헤더(실제 사용자가 접속한 도메인)를 우선 사용
function getOrigin(req: Parameters<typeof auth>[0]): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  // 환경변수 fallback
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  return req.nextUrl.origin
}

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role
  const origin = getOrigin(req)

  // 회원 관리 · 단체 승인 → ADMIN 전용
  if (pathname.startsWith('/admin/members') || pathname.startsWith('/admin/organizations')) {
    if (!hasRole(userRole, 'ADMIN')) {
      return NextResponse.redirect(`${origin}/`)
    }
  // 나머지 관리 메뉴(자료·일정·카테고리) → OFFICER 이상
  } else if (pathname.startsWith('/admin')) {
    if (!hasRole(userRole, 'OFFICER')) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  if (pathname.startsWith('/resources')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(`${origin}/auth/login?callbackUrl=${encodeURIComponent(pathname)}&notice=premium`)
    }
    if (!hasRole(userRole, 'PREMIUM')) {
      return NextResponse.redirect(`${origin}/member/upgrade`)
    }
  }

  if (pathname.startsWith('/community') || pathname.startsWith('/network')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(`${origin}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }

  if (pathname.startsWith('/member')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(`${origin}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/community/:path*', '/network/:path*', '/resources/:path*', '/member/:path*'],
}
