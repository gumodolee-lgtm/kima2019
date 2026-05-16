import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse, type NextRequest } from 'next/server'

const ROLE_HIERARCHY = { MEMBER: 1, PREMIUM: 2, OFFICER: 3, ADMIN: 4 } as const

function hasRole(userRole: string | undefined, required: keyof typeof ROLE_HIERARCHY) {
  if (!userRole) return false
  return (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0) >= ROLE_HIERARCHY[required]
}

// Vercel Edge Runtime에서 req.url이 *.vercel.app 내부 도메인으로 처리되는 문제 방지.
// NEXTAUTH_URL이 설정된 프로덕션 환경에서는 해당 값을 우선 사용하고,
// 개발 환경에서는 x-forwarded-host를 NEXTAUTH_URL 호스트와 대조 후 사용.
function getOrigin(req: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '')

  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`

  return req.nextUrl.origin
}

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // kima2019.vercel.app → kima2019.org 리다이렉트
  // NEXTAUTH_URL이 vercel.app이 아닌 경우에만 리디렉트 (루프 방지)
  const host = req.headers.get('host') ?? req.nextUrl.hostname
  const canonical = process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? ''
  if (host.endsWith('.vercel.app') && canonical && !canonical.includes('.vercel.app')) {
    return NextResponse.redirect(`${canonical}${pathname}${req.nextUrl.search}`, { status: 301 })
  }

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

  if (pathname === '/directory/register') {
    if (!isLoggedIn) {
      return NextResponse.redirect(`${origin}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/community/:path*',
    '/network/:path*',
    '/resources/:path*',
    '/member/:path*',
    '/directory/register',
  ],
}
