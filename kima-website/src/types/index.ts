import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      expiresAt: string | null
      email: string
      name?: string | null
      image?: string | null
    }
  }
  interface User {
    role: UserRole
    expiresAt?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
    expiresAt?: string | null
  }
}

