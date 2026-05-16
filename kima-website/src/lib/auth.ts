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
  session: { strategy: 'jwt', updateAge: 5 * 60 },
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

        // password 컬럼 우선 사용, 없으면 레거시 account.access_token 폴백
        let hash = user.password
        if (!hash) {
          const account = await prisma.account.findFirst({
            where: { userId: user.id, provider: 'credentials' },
          })
          hash = account?.access_token ?? null
        }
        if (!hash) return null

        const isValid = await bcrypt.compare(credentials.password as string, hash)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 최초 로그인 시 역할 저장
        token.id = user.id as string
        token.role = (user.role ?? 'MEMBER') as UserRole
        token.roleRefreshedAt = Math.floor(Date.now() / 1000)
      } else if (token.id) {
        // 5분마다 DB에서 역할을 다시 조회 (관리자 등급 변경 즉시 반영)
        const now = Math.floor(Date.now() / 1000)
        const lastRefresh = (token.roleRefreshedAt as number) ?? 0
        if (now - lastRefresh > 300) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          }).catch(() => null)
          if (dbUser) {
            token.role = dbUser.role as UserRole
            token.roleRefreshedAt = now
          }
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = (token.role ?? 'MEMBER') as UserRole
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
