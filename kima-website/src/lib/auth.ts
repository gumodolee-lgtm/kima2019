import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@prisma/client'
import { checkRateLimit } from '@/lib/rateLimit'
import { authConfig } from '@/auth.config'
import '@/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    Credentials({
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

        // 이메일당 15분에 10회 로그인 시도 제한
        const email = credentials.email as string
        const { allowed } = checkRateLimit(`login:${email}`, {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        })
        if (!allowed) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.email) return null

        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'credentials' },
        })

        if (!account?.access_token) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          account.access_token
        )
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        // Google OAuth 사용자는 DB의 기본값(MEMBER)이 적용됨
        token.role = (user.role ?? 'MEMBER') as UserRole
        // 로그인 시점에 DB에서 expiresAt 조회 — 만료 체크에 사용
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { expiresAt: true },
        })
        token.expiresAt = dbUser?.expiresAt?.toISOString() ?? null
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
  events: {
    // 새 OAuth 사용자 생성 시 MEMBER 역할 보장
    async createUser({ user }) {
      if (!user.id) return
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'MEMBER' },
      }).catch(() => {})
    },
  },
})
