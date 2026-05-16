import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@prisma/client'

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user.role ?? 'MEMBER') as UserRole
        // expiresAt은 lib/auth.ts의 jwt 콜백에서 DB 조회 후 저장됨
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = (token.role ?? 'MEMBER') as UserRole
      session.user.expiresAt = (token.expiresAt as string | null | undefined) ?? null
      return session
    },
  },
} satisfies NextAuthConfig
