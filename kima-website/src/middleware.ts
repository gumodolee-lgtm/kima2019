import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

// 유효한 정회원 여부: ADMIN·OFFICER는 만료 없음, PREMIUM은 expiresAt 체크
function hasValidPremium(role?: string | null, expiresAt?: string | null): boolean {
  if (role === 'ADMIN' || role === 'OFFICER') return true
  if (role !== 'PREMIUM') return false
  if (!expiresAt) return false
  return new Date(expiresAt) > new Date()
}

export default auth((req: NextRequest & { auth: { user?: { role?: string; expiresAt?: string | null } } | null }) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session?.user
  const role = session?.user?.role
  const expiresAt = session?.user?.expiresAt

  // /admin/* — ADMIN 전용
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
    return NextResponse.next()
  }

  // /resources/* — 유효한 정회원(PREMIUM+미만료) 또는 OFFICER·ADMIN
  if (nextUrl.pathname.startsWith('/resources')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!hasValidPremium(role, expiresAt)) {
      return NextResponse.redirect(new URL('/member/upgrade', nextUrl))
    }
    return NextResponse.next()
  }

  // /community/*, /network/*, /member/*, /directory/register — 로그인 필요
  const memberPaths = ['/community', '/network', '/member', '/directory/register']
  if (memberPaths.some((p) => nextUrl.pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|images/).*)'],
}
