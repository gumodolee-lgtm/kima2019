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
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = (token.role ?? 'MEMBER') as UserRole
      return session
    },
  },
} satisfies NextAuthConfig
